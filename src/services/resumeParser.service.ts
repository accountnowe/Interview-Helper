// src/services/resumeParser.service.ts

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { type CandidateInfo } from '../store/types';

// Configure PDF.js worker - use local worker from node_modules
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export class ResumeParserService {
  
  /**
   * Extract text from PDF file
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to parse PDF file. Please ensure it\'s a valid PDF.');
    }
  }

  /**
   * Extract text from DOCX file
   */
  private static async extractTextFromDOCX(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting DOCX text:', error);
      throw new Error('Failed to parse DOCX file. Please ensure it\'s a valid DOCX.');
    }
  }

  /**
   * Extract candidate information from text
   */
  private static extractInformation(text: string): CandidateInfo {
    const info: CandidateInfo = {};

    // Extract name (look for common patterns)
    // Usually name is at the top, in all caps or title case
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // Check if first line looks like a name (2-4 words, mostly letters)
      if (/^[A-Za-z\s]{2,50}$/.test(firstLine) && firstLine.split(' ').length <= 4) {
        info.name = firstLine;
      }
    }

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      info.email = emailMatch[0].toLowerCase();
    }

    // Extract phone number (various formats)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,}/;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      // Clean up the phone number
      info.phone = phoneMatch[0].replace(/\s+/g, ' ').trim();
    }

    return info;
  }

  /**
   * Parse resume file and extract information
   */
  static async parseResume(file: File): Promise<{ text: string; info: CandidateInfo }> {
    const fileName = file.name.toLowerCase();
    let text = '';

    if (fileName.endsWith('.pdf')) {
      text = await this.extractTextFromPDF(file);
    } else if (fileName.endsWith('.docx')) {
      text = await this.extractTextFromDOCX(file);
    } else {
      throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
    }

    if (!text || text.trim().length < 50) {
      throw new Error('Resume appears to be empty or too short. Please upload a valid resume.');
    }

    const info = this.extractInformation(text);

    return { text, info };
  }

  /**
   * Validate file before parsing
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
      return { valid: false, error: 'Please upload a PDF or DOCX file.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB.' };
    }

    if (file.size < 100) {
      return { valid: false, error: 'File appears to be empty.' };
    }

    return { valid: true };
  }
}