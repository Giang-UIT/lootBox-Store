// grabs the current user data from local storage
// inputs: none
// outputs: returns the parsed user object, or null if no one is logged in
export function getCurrentUser() {
  const user = localStorage.getItem("account")
  return user ? JSON.parse(user) : null
}