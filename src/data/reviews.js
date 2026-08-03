/** Mock reviews keyed by product slug. Phase C pulls these from the backend. */
export const reviews = {
  'ips-lcd-gaming-monitor': [
    { id: 'r1', author: 'Jamie L.', rating: 5, date: '2026-06-12', title: 'Crisp and fast', body: 'Zero ghosting, colors pop right out of the box.' },
    { id: 'r2', author: 'Riya P.', rating: 4, date: '2026-05-30', title: 'Great for the price', body: 'Stand could be better but the panel is excellent.' },
  ],
  'canon-eos-dslr-camera': [
    { id: 'r3', author: 'Marcus T.', rating: 5, date: '2026-06-02', title: 'My go-to travel camera', body: 'Sharp images, reliable autofocus, and the kit lens surprised me.' },
    { id: 'r4', author: 'Aisha K.', rating: 4, date: '2026-04-18', title: 'Lovely colors', body: 'Skin tones are great straight out of camera. Wish it had a deeper buffer.' },
  ],
  'jbl-bluetooth-speaker': [
    { id: 'r5', author: 'Devon R.', rating: 5, date: '2026-06-20', title: 'Beach-ready beast', body: 'Sand and salt water, no problem. Bass is unreal for the size.' },
  ],
  'laptop-slim-body-pro': [
    { id: 'r6', author: 'Sana M.', rating: 5, date: '2026-07-04', title: 'Best laptop I have owned', body: 'OLED is gorgeous and it lasts a full workday on a charge.' },
    { id: 'r7', author: 'Leo F.', rating: 4, date: '2026-06-15', title: 'Premium but pricey', body: 'Build quality is superb. Only docked a star for the port selection.' },
  ],
  'h1-gamepad': [
    { id: 'r8', author: 'Priya S.', rating: 5, date: '2026-06-08', title: 'Hall-effect sticks for the win', body: 'No drift after months of use. Feels premium in hand.' },
  ],
}

/** Returns the review list for a product slug (empty array when none exist). */
export const getReviews = (slug) => reviews[slug] || []
