export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { 
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `HTTP ${res.status}`)
  }
  
  return res.json()
}

export async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `HTTP ${res.status}`)
  }
  
  return res.json()
}

export async function apiPut<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `HTTP ${res.status}`)
  }
  
  return res.json()
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `HTTP ${res.status}`)
  }
  
  return res.json()
}