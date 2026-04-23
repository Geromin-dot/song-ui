const BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const getSongs = async () => {
  const response = await fetch(BASE_URL);
  if (!response.ok) throw new Error("Failed to fetch songs");
  return response.json();
};

export const postSong = async (songData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(songData),
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to post song: ${errorText || response.statusText}`);
  }
  
  return response.json();
};
