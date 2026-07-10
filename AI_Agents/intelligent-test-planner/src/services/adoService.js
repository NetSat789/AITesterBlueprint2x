// Azure DevOps API Service
// Uses Vercel serverless proxy to avoid CORS

// Unicode-safe base64 encoding (btoa only supports Latin-1)
function safeBase64(str) {
  const bytes = new TextEncoder().encode(str)
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('')
  return btoa(binString)
}

// Proxy helper — routes through /api/proxy serverless function
async function proxyFetch(targetUrl, options = {}) {
  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetUrl,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body ? JSON.parse(options.body) : undefined,
    }),
  })

  const result = await response.json()

  if (result.error) {
    throw new Error(result.error)
  }

  if (result.status >= 400) {
    const errorMsg = typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
    throw new Error(`(${result.status}): ${errorMsg}`)
  }

  return result.data
}

export async function testAdoConnection(orgUrl, pat) {
  try {
    const baseUrl = orgUrl.replace(/\/+$/, '')
    const data = await proxyFetch(`${baseUrl}/_apis/projects?api-version=7.0`, {
      headers: {
        'Authorization': 'Basic ' + safeBase64(`:${pat}`),
        'Accept': 'application/json',
      },
    })

    return { success: true, projects: data.value?.map(p => p.name) || [] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function fetchAdoWorkItems(connection, projectName, query) {
  try {
    const baseUrl = connection.url.replace(/\/+$/, '')

    const wiql = query || `SELECT [System.Id], [System.Title], [System.State], [System.WorkItemType] FROM WorkItems WHERE [System.TeamProject] = '${projectName}' AND [System.State] <> 'Closed' ORDER BY [System.CreatedDate] DESC`

    const data = await proxyFetch(
      `${baseUrl}/${projectName}/_apis/wit/wiql?api-version=7.0`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + safeBase64(`:${connection.pat}`),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: wiql }),
      }
    )

    if (!data.workItems || data.workItems.length === 0) {
      return []
    }

    const ids = data.workItems.slice(0, 50).map(wi => wi.id)
    const details = await proxyFetch(
      `${baseUrl}/_apis/wit/workitems?ids=${ids.join(',')}&fields=System.Id,System.Title,System.State,System.WorkItemType,System.Description,Microsoft.VSTS.Common.Priority&api-version=7.0`,
      {
        headers: {
          'Authorization': 'Basic ' + safeBase64(`:${connection.pat}`),
          'Accept': 'application/json',
        },
      }
    )

    return details.value.map(wi => ({
      id: `${wi.id}`,
      title: wi.fields['System.Title'] || 'Untitled',
      type: wi.fields['System.WorkItemType'] || 'Task',
      status: wi.fields['System.State'] || 'New',
      priority: priorityMap[wi.fields['Microsoft.VSTS.Common.Priority']] || 'Medium',
      description: wi.fields['System.Description'] || '',
      labels: [],
      assignee: wi.fields['System.AssignedTo']?.displayName || 'Unassigned',
    }))
  } catch (error) {
    throw new Error(`ADO fetch failed: ${error.message}`)
  }
}

const priorityMap = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
}
