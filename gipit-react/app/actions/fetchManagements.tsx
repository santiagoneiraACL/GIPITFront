export async function fetchManagements(companyId: number) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/management?company_id=${companyId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch managements: ${response.statusText}`);
  }
  return response.json();
}