/**
 * Frontend API client to communicate with FitDaily backend database
 */

export async function fetchInitialData() {
  const res = await fetch('/api/init');
  if (!res.ok) {
    throw new Error(`Failed to load data from server: ${res.statusText}`);
  }
  return res.json();
}

export async function saveActivityApi(activity) {
  const res = await fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  });
  if (!res.ok) {
    throw new Error(`Failed to save activity: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteActivityApi(activityId) {
  const res = await fetch(`/api/activities?id=${encodeURIComponent(activityId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete activity: ${res.statusText}`);
  }
  return res.json();
}

export async function saveCompletionApi(date, activityId, completed, completedAt) {
  const res = await fetch('/api/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, activityId, completed, completedAt }),
  });
  if (!res.ok) {
    throw new Error(`Failed to record completion: ${res.statusText}`);
  }
  return res.json();
}

export async function saveSettingsApi(settings) {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    throw new Error(`Failed to save settings: ${res.statusText}`);
  }
  return res.json();
}

export async function resetDataApi(type = 'progress') {
  const res = await fetch('/api/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    throw new Error(`Failed to reset data: ${res.statusText}`);
  }
  return res.json();
}
