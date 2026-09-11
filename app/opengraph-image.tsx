import { ImageResponse } from 'next/og';

export const alt = 'Resume Feed — thoughtful feedback for your resume';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: '#fafafa',
          color: '#242424',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '34px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              background: '#242424',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fafafa">
              <path d="M5 6h9M5 12h14M5 18h11" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 700 }}>Resume Feed</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '940px' }}>
          <div style={{ fontSize: '82px', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-3px' }}>
            Better resumes start with thoughtful feedback.
          </div>
          <div style={{ fontSize: '30px', color: '#666' }}>
            Share your resume, get a real review, and help others improve theirs.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
