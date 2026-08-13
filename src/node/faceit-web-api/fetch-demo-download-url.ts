import { FaceitUnauthorized } from './errors/faceit-unauthorized';
import { FaceitResourceNotFound } from './errors/faceit-resource-not-found';
import { FaceitForbiddenError } from './errors/faceit-forbidden-error';
import { FaceitApiError } from './errors/faceit-api-error';
import { FaceitInvalidRequest } from './errors/faceit-invalid-request';

type FaceitDemoDownloadDTO = {
  payload: {
    download_url: string;
  };
};

// FACEIT demos links are private, a temporary download link has to be requested through the "Download API".
// It requires an API key that has been granted access to it by FACEIT.
// https://docs.faceit.com/getting-started/Guides/download-api
export async function fetchDemoDownloadUrl(resourceUrl: string, apiKey: string) {
  const response = await fetch('https://open.faceit.com/download/v2/demos/download', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resource_url: resourceUrl,
    }),
  });

  if (response.status === 401) {
    throw new FaceitUnauthorized();
  }

  if (response.status === 404) {
    throw new FaceitResourceNotFound();
  }

  if (response.status === 403) {
    throw new FaceitForbiddenError();
  }

  if (response.status === 400) {
    throw new FaceitInvalidRequest();
  }

  if (response.status !== 200) {
    throw new FaceitApiError(response.status);
  }

  const { payload }: FaceitDemoDownloadDTO = await response.json();

  return payload.download_url;
}
