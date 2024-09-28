import { getCourseCommunityNotes } from "../api/notes";

const useFetchCourseCommunityNotes = () => {
  const fetchCourseCommunityNotes = async (courseID: string) => {
    try {
      return await getCourseCommunityNotes(courseID);
    } catch (error) {
      console.error("Error fetching course community notes:", error);
      return [];
    }
  };
  return { fetchCourseCommunityNotes };
};

export default useFetchCourseCommunityNotes;

