import { getUserProfileInfo } from "../api/user";

export function fetchUserProfile(token) {
  return getUserProfileInfo(token);
}

