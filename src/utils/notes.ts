import { INote } from "./types";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
export const fetchSections = (courseNotes: INote[]) => {
  const sections = courseNotes.reduce((acc: INote[], note) => {
    const section = acc.find((section) => section.lecture === note.lecture);
    if (!section) {
      acc.push(note);
    }

    return acc;
  }, []);
  console.log("sections", sections);
  return sections;
};

export const getLectureName = (noteToEdit: INote | null = null) => {
  if (noteToEdit) {
    // If we're editing a note, return the lecture name from the note
    return noteToEdit.lecture;
  }

  // If we're adding a new note, use the existing logic to get the lecture name from the DOM
  const currentItems = document.querySelectorAll(
    '[class*="curriculum-item-link--is-current"]'
  );
  let text = "";
  currentItems.forEach((item) => {
    const titleElement = item.querySelector('[data-purpose="item-title"]');
    if (titleElement) {
      text = titleElement.textContent?.trim() || "";
    }
  });

  return text;
};

const parseContent = (content: string) => {
  return JSON.parse(content).map((node: any) => ({
    type: node.type,
    children: node.children.map((child: any) => ({
      text: child.text,
      bold: child.bold,
      italic: child.italic,
      underline: child.underline,
      code: child.code,
    })),
  }));
};

export const exportToWord = async (title: string, content: string) => {
  const parsedContent = parseContent(content);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
          }),
          ...parsedContent.map(
            (node: any) =>
              new Paragraph({
                children: node.children.map(
                  (child: any) =>
                    new TextRun({
                      text: child.text,
                      bold: child.bold,
                      italics: child.italic,
                      underline: child.underline,
                      ...(child.code && { font: "Courier New" }),
                    })
                ),
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
};
// ... existing exportToGoogleDocs function ...

