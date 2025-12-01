const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.listup.ng/api";

export async function getFavourites() {
  const res = await fetch(`${API_BASE_URL}/favourites`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to load favourites');
  return res.json();
}

export async function toggleFavourite(listingId: string) {
  // Try to create/upsert
  const res = await fetch(`${API_BASE_URL}/favourites/${listingId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to save listing');
  return res.json();
}

export async function removeFavourite(listingId: string) {
  const res = await fetch(`${API_BASE_URL}/favourites/${listingId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok && res.status !== 204) throw new Error('Failed to remove saved listing');
  return true;
}
