# Living confluence

## Design plan

Preserve the approved palette: ink #0B1016, lime #B5F36B, white #F4F7F8, muted #A7B2BF, contour #52734A, surface #151D25. Geist Sans remains the editorial voice; Geist Mono remains the small geographic annotation face. Typography and the left-aligned two-column layout do not change.

```
[ headline + invitation ] [ north stream     ]
[ supporting copy      ] [       ↘          ]
[ join / events        ] [        ● ← east  ]
                        [        ↓ south    ]
```

The three-dimensional treatment belongs to the river/network illustration only. Moving signals follow three connected cubic routes; shallow relief and pointer tilt make the existing contours spatial. Labels stay crisp SVG, independent of WebGL. No generic rotating globe, starfield, scroll hijacking or repeating card animations.

Review: the requested dark/lime identity is preserved. A generic particle background was rejected because it would lose the locality of the confluence. Motion instead follows the actual subject-specific topology. Keep the rest of the page visually still.

## Engineering decisions

- Server-rendered SVG stays available before JavaScript, when WebGL is unavailable, with data saving, and for reduced-motion users.
- One small client controller conditionally imports the scene and Three.js after the visual enters the viewport and the browser is idle.
- Frame values and pointer targets live outside React state. Only readiness and the pause button use state.
- Streams animate in GPU shaders; static geometry is allocated once. No textures, downloaded models, lighting passes or postprocessing.
- Pixel ratio is capped; rendering is limited to 30 fps. Pause when offscreen, in a hidden tab or when the visitor pauses. Dispose observers, listeners, geometries, materials and renderer on navigation/unmount.
- Respect live changes to prefers-reduced-motion. The pause control is keyboard accessible, separate from the image's accessible name, and changes no essential content.

References: https://threejs.org/docs/pages/WebGLRenderer ; https://threejs.org/manual/pages/how-to-dispose-of-objects.html ; Next.js bundled lazy-loading documentation and the requested frontend-design / vercel-react-best-practices skills.

## Verification (2026-11-07)

- `npm run typecheck`, all 27 existing regression tests, and `npm run build` passed.
- Inspected real WebGL output on desktop and at a 390×844 phone viewport; content width remained 390 px. Updated both preview images.
- Pause click set the render state to paused and aria-pressed to true. Enter resumed the loop and reset aria-pressed to false.
- Scrolling beyond the hero set render state to paused. Navigating to Programs removed every confluence canvas; returning to Home created one new scene.
- No error-level browser logs observed during these journeys, including after GPU cleanup.
- Production output emits scene and Three.js code into deferred chunks rather than initial HTML script references. Frame values never enter React state; shaders animate signals without geometry allocations per frame.
- Reduced-motion/data-saving and WebGL-unavailable paths were reviewed in source. Browser preference emulation and device-driver context-loss injection were not performed. The SVG remains in server output independent of all WebGL logic.
