//
// Usage: node generate_pdf.js data/sample_payload.json output/Workorder_REV_A.pdf

const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

async function generatePdf(dataPath, outputPdfPath) {
  // 1. Read and parse the JSON payload
  const payload = await fs.readJson(dataPath);

  // 2. Locate the EJS template
  const templatePath = path.resolve(__dirname, '../templates/index.html');
  const templateString = await fs.readFile(templatePath, 'utf-8');

  // 3. Render the HTML (IMPORTANT: pass `filename: templatePath` so that includes work)
  const html = ejs.render(
    templateString,
    payload,
    {
      // By supplying `filename`, EJS will resolve all <%- include("partials/…") %> calls
      filename: templatePath,
      // (any other EJS options you need can go here)
    }
  );

  // 4. Write the rendered HTML to a temporary file
  const tempDir = path.resolve(__dirname, '../temp');
  await fs.ensureDir(tempDir);
  const tempHtmlPath = path.join(tempDir, 'rendered.html');
  await fs.writeFile(tempHtmlPath, html, 'utf-8');

  // 5. Launch Puppeteer and convert the HTML to PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file:${tempHtmlPath}`, { waitUntil: 'networkidle0' });

  // 6. Save the PDF to the requested output path
  await fs.ensureDir(path.dirname(outputPdfPath));
  await page.pdf({ path: outputPdfPath, format: 'A4', printBackground: true });

  await browser.close();
}

//
// CLI handling (so you can run this via `node scripts/generate_pdf.js <data.json> <output.pdf>`)
//
(async () => {
  const [,, dataPath, outputPdfPath] = process.argv;
  if (!dataPath || !outputPdfPath) {
    console.error('Usage: node generate_pdf.js <data.json> <output.pdf>');
    process.exit(1);
  }
  try {
    await generatePdf(dataPath, outputPdfPath);
    console.log(`✅ PDF written to: ${outputPdfPath}`);
  } catch (err) {
    console.error('Error generating PDF:', err);
    process.exit(1);
  }
})();
