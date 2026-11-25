export const capitialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const getErrorMessage = (error) => {
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) return serverMessage;
  if (error?.request) {
    return "Unable to reach the server. Please make sure the backend is running.";
  }
  return error?.message || "Something went wrong. Please try again.";
};