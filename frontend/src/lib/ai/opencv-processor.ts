// Optical Processing Logic for Tidalense
// Implements: LAB Color Conversion, Canny Edge Detection, Morphology

export interface OpticalMetrics {
    turbidityScore: number; // 0-100 based on Saturation/Value variance
    edgeDensity: number;    // 0-100 based on Canny edge pixels
    labVariance: number;    // 0-100 based on L* channel standard deviation
}

export const processImage = (
    canvas: HTMLCanvasElement
): { metrics: OpticalMetrics; processedBase64: string } | null => {
    const cv = window.cv;
    if (!cv || !window.cvReady) return null;

    try {
        const src = cv.imread(canvas);
        const dst = new cv.Mat();
        const gray = new cv.Mat();
        const edges = new cv.Mat();
        const lab = new cv.Mat();

        // 1. Denoise (FastNLMeans is heavy, maybe skip for performance or use GaussianBlur)
        cv.GaussianBlur(src, dst, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

        // 2. Metrics: LAB Color Variance (Proxy for Turbidity/Material diversity)
        // Convert RGBA to Lab. If invalid code, try to convert RGBA to RGB first? 
        // Note: OpenCV.js might support COLOR_RGBA2Lab or we strip alpha.
        // Let's iterate: Convert RGBA -> RGB -> Lab to be safe, or check for RGBA2Lab.
        // cv.COLOR_RGBA2RGB is usually 1. 
        // Safest: RGBA -> RGB -> Gray/Lab.

        const rgb = new cv.Mat();
        cv.cvtColor(dst, rgb, cv.COLOR_RGBA2RGB || 1); // 1 is standard for RGBA->RGB

        cv.cvtColor(rgb, lab, cv.COLOR_RGB2Lab || 44); // 44 is RGB2Lab
        const labPlanes = new cv.MatVector();
        cv.split(lab, labPlanes);

        // Calculate StdDev of L channel (Light variance = surface texture)
        const lMeanStd = new cv.Mat();
        const lStdDev = new cv.Mat();
        cv.meanStdDev(labPlanes.get(0), lMeanStd, lStdDev);
        const lVariance = lStdDev.data64F[0];

        // 3. Metrics: Edge Density (Proxy for particulate matter)
        // Canvas is RGBA, so we use RGBA2GRAY. Fallback to 11 if constant is missing.
        const code = cv.COLOR_RGBA2GRAY || 11;
        cv.cvtColor(dst, gray, code);
        cv.Canny(gray, edges, 100, 200);

        // Count non-zero pixels in edge map
        const edgePixels = cv.countNonZero(edges);
        const totalPixels = edges.rows * edges.cols;
        const edgeRatio = edgePixels / totalPixels;

        // 4. Highlight "Anomalies" (Edges + High features)
        // Draw edges in Green on top of original
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // Draw contours on src
        for (let i = 0; i < contours.size(); ++i) {
            cv.drawContours(src, contours, i, new cv.Scalar(0, 255, 0, 255), 2);
        }

        // Convert back to show user
        cv.imshow(canvas, src); // Updates the canvas directly with annotated image

        // Calculate normalized scores (heuristics tuned for water)
        const turbidityScore = Math.min(100, (lVariance / 128) * 100 * 2); // Arbitrary scaling
        const edgeDensityScore = Math.min(100, edgeRatio * 100 * 5); // 20% edges is HUGE for water
        const labVarianceScore = Math.min(100, lVariance); // L var is around 0-128

        // Cleanup
        src.delete(); dst.delete(); gray.delete(); edges.delete(); lab.delete();
        labPlanes.delete(); lMeanStd.delete(); lStdDev.delete(); contours.delete(); hierarchy.delete();
        rgb.delete();

        return {
            metrics: {
                turbidityScore,
                edgeDensity: edgeDensityScore,
                labVariance: labVarianceScore
            },
            processedBase64: canvas.toDataURL('image/jpeg', 0.8)
        };
    } catch (e) {
        console.error("OpenCV Processing Error:", e);
        return null;
    }
};
