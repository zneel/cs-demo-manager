import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vite-plus/test';
import type { PinnedPlayer } from 'csdm/common/types/pinned-player';
import { LeftBarLink } from './left-bar-link';
import { PinnedPlayerLink } from './pinned-player-link';

// JSX is not used because *.test.tsx files are not covered by the lint overrides of the project.
function render(route: string, element: ReturnType<typeof createElement>) {
  return renderToString(createElement(MemoryRouter, { initialEntries: [route] }, element));
}

describe('Left bar link', () => {
  it('renders a truncated label under the icon', () => {
    const html = render(
      '/matches',
      createElement(LeftBarLink, {
        icon: createElement('svg'),
        tooltip: 'Tooltip',
        label: 'ALongPlayerName',
        url: '/players/76561198000123456',
      }),
    );

    expect(html).toContain('truncate');
    // The label must come after the icon so that it's rendered under it.
    expect(html.indexOf('ALongPlayerName')).toBeGreaterThan(html.indexOf('<svg'));
  });

  it('renders no label when none is given', () => {
    const html = render(
      '/matches',
      createElement(LeftBarLink, { icon: createElement('svg'), tooltip: 'Tooltip', url: '/matches' }),
    );

    expect(html).not.toContain('<p');
  });
});

describe('Pinned player link', () => {
  const player: PinnedPlayer = { steamId: '76561198000123456', name: 'ZywOo', avatar: null };

  it('renders the player name and falls back to its initials when it has no avatar', () => {
    const html = render('/matches', createElement(PinnedPlayerLink, { player }));

    expect(html).toContain('ZywOo');
    expect(html).toContain('ZY');
    expect(html).toContain('href="/players/76561198000123456"');
  });

  it('highlights the link only when the player profile is the active route', () => {
    const activeHtml = render('/players/76561198000123456/charts', createElement(PinnedPlayerLink, { player }));
    const inactiveHtml = render('/matches', createElement(PinnedPlayerLink, { player }));

    expect(activeHtml).toContain('opacity-100');
    expect(inactiveHtml).toContain('opacity-50');
  });
});
