const pdfParse = require("pdf-parse");
import mammoth from "mammoth";

/**
 * Normalizes and cleans extracted text to improve AI parsing.
 * Removes excessive whitespace, null bytes, and non-printable characters.
 * @param {string} text 
 * @returns {string}
 */
function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/\u0000/g, "") // Remove null bytes
    .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Replace non-printable chars with space (optional, keeps basic ASCII + newlines)
    .replace(/\n\s*\n/g, "\n\n") // Collapse multiple blank lines
    .replace(/[ \t]+/g, " ") // Collapse multiple spaces
    .trim();
}

/**
 * Extracts raw text from a PDF buffer.
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
export async function extractPdfText(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = cleanText(data.text);
    if (!text || text.length < 50) {
      throw new Error("Extracted text is too short or empty.");
    }
    return text;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error("Unable to extract text from this PDF. Please ensure it is a text-based PDF.");
  }
}

/**
 * Extracts raw text from a DOCX buffer.
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
export async function extractDocxText(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = cleanText(result.value);
    if (!text || text.length < 50) {
      throw new Error("Extracted text is too short or empty.");
    }
    return text;
  } catch (error) {
    console.error("DOCX Extraction Error:", error);
    throw new Error("Unable to extract text from this DOCX. Please ensure it is a valid document.");
  }
}

/**
 * General utility to extract text based on file extension.
 * @param {Buffer} buffer 
 * @param {string} fileName 
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(buffer, fileName) {
  const ext = fileName.toLowerCase().split('.').pop();
  
  if (ext === "pdf") {
    return await extractPdfText(buffer);
  } else if (ext === "docx" || ext === "doc") {
    // Note: mammoth only supports .docx, not legacy .doc
    if (ext === "doc") {
      throw new Error("Legacy .doc format is not supported. Please convert to .docx or .pdf.");
    }
    return await extractDocxText(buffer);
  }
  
  throw new Error(`Unsupported file type: .${ext}. Please upload a PDF or DOCX.`);
}
