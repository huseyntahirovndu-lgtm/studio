export const uploadFile = async (file: File): Promise<{ success: boolean, url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/files/sekiller', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Fayl yüklənərkən xəta baş verdi.');
  }

  return result;
};
