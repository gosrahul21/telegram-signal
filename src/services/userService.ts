import userRepository from "../repositories/userRepository";

// Re-export userRepository to avoid code duplication across services and repositories
export const userService = userRepository;
export default userRepository;
