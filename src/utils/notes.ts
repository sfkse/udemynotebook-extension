import { INote } from "./types";

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

export const getLectureName = () => {
  // Step 1: Find all elements that have a class matching "curriculum-item-link--is-current"
  const currentItems = document.querySelectorAll(
    '[class*="curriculum-item-link--is-current"]'
  );
  let text = "";
  // Step 2: Iterate over the found items to find the text "13. Chrome Notifications API"
  currentItems.forEach((item) => {
    // Step 3: Find the nested element containing the title using 'data-purpose' attribute
    const titleElement = item.querySelector('[data-purpose="item-title"]');
    text = titleElement.textContent.trim();
  });

  return text;
};
