import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = './public/frames';
const outputDir = './public/frames-mobile';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const totalFrames = 240;
const totalMobileFrames = 40;
const skip = Math.floor(totalFrames / totalMobileFrames);

let mobileIndex = 1;

async function processFrames() {
    console.log(`Starting compression to output directory: ${outputDir}`);
    for (let i = 1; i <= totalFrames; i += skip) {
        if (mobileIndex > totalMobileFrames) break;

        const paddedIndex = i.toString().padStart(3, "0");
        const outPaddedIndex = mobileIndex.toString().padStart(3, "0");

        const inPath = path.join(inputDir, `ezgif-frame-${paddedIndex}.png`);
        const outPath = path.join(outputDir, `frame-${outPaddedIndex}.webp`);

        if (fs.existsSync(inPath)) {
            await sharp(inPath)
                .resize({ width: 720 })
                .webp({ quality: 60 })
                .toFile(outPath);
            console.log(`Processed mobile frame ${mobileIndex} from original ${i}`);
        } else {
            console.log(`File missing: ${inPath}`);
        }
        mobileIndex++;
    }
    console.log("Compression completely finished.");
}

processFrames();
