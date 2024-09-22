import { getCourseNotes } from "../api/notes";

const useFetchLectureNotes = () => {
  // const [courseNotes, setCourseNotes] = React.useState<INote[]>([]);

  const fetchCourseNotes = async (lectureID: string, userID: string) => {
    try {
      return await getCourseNotes(lectureID, userID);
    } catch (error) {
      console.error("Error fetching course notes:", error);
      return [];
    }
  };
  return { fetchCourseNotes };
};

export default useFetchLectureNotes;

