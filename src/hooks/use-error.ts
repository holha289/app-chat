

export const useErrorResponse = (error: any) => {
   const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error);
  return errorMessage;
};

