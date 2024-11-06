// backend/controllers/certificateController.js
const Certificate = require("../models/Certificate");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.createCertificate = async (req, res) => {
  try {
    const certificateData = req.body;
    const newCertificate = new Certificate(certificateData);
    await newCertificate.save();

    // Tạo file Word
    const doc = new Document();
    doc.addSection({
      children: [
        new Paragraph({
          children: [new TextRun(`Văn bằng của ${certificateData.studentName}`)]
        }),
        new Paragraph({
          children: [new TextRun(`Mã sinh viên: ${certificateData.studentId}`)]
        }),
        new Paragraph({
          children: [new TextRun(`Khóa học: ${certificateData.course}`)]
        }),
        new Paragraph({
          children: [new TextRun(`Ngành học: ${certificateData.major}`)]
        }),
        new Paragraph({
          children: [new TextRun(`Ngày cấp: ${certificateData.issueDate}`)]
        }),
        new Paragraph({
          children: [new TextRun(`Loại bằng: ${certificateData.degreeType}`)]
        }),
        new Paragraph({
          children: [new TextRun(`Đơn vị cấp: ${certificateData.issuingUnit}`)]
        })
      ]
    });

    const wordFilePath = path.join(
      __dirname,
      `../certificates/${certificateData.studentId}.docx`
    );
    const pdfFilePath = path.join(
      __dirname,
      `../certificates/${certificateData.studentId}.pdf`
    );

    // Lưu file Word
    await Packer.toBuffer(doc).then(buffer => {
      fs.writeFileSync(wordFilePath, buffer);
    });

    // Tạo và lưu file PDF
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(pdfFilePath));
    pdfDoc.fontSize(20).text(`Văn bằng của ${certificateData.studentName}`);
    pdfDoc.fontSize(14).text(`Mã sinh viên: ${certificateData.studentId}`);
    pdfDoc.text(`Khóa học: ${certificateData.course}`);
    pdfDoc.text(`Ngành học: ${certificateData.major}`);
    pdfDoc.text(`Ngày cấp: ${certificateData.issueDate}`);
    pdfDoc.text(`Loại bằng: ${certificateData.degreeType}`);
    pdfDoc.text(`Đơn vị cấp: ${certificateData.issuingUnit}`);
    pdfDoc.end();

    res.status(201).json({
      message: "Văn bằng đã được tạo và lưu.",
      files: { word: wordFilePath, pdf: pdfFilePath }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo văn bằng", error });
  }
};
