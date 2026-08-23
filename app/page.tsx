'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

const CircularGalleryDynamic = dynamic(
  () => import('@/components/CircularGallery').then((mod: { default: ComponentType<{ items?: Array<{ image: string; text: string }>; bend?: number; textColor?: string; borderRadius?: number; scrollSpeed?: number; scrollEase?: number }> }) => mod.default),
  { ssr: false, loading: () => <div className="gallery-frame" style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase' }}>Loading gallery...</div> }
)

const galleryItems = [
  { image: '/gallery/1.jpg', text: 'Sugar & Spice' },
  { image: '/gallery/2.jpg', text: 'Threadline' },
  { image: '/gallery/3.jpg', text: 'Nest & Co.' },
  { image: '/gallery/4.png', text: 'AI UGC Clip' },
  { image: '/gallery/5.png', text: 'Product Shoot' },
  { image: '/gallery/6.png', text: 'Brand Explainer' },
]

const portrait = '/hero-portrait.png'
const ceo = '/ceo.avif'
const rocket = '/rocket.gif'
const golf = '/golf.gif'

const services = [
  ['01', 'AI Video Production', 'Cinematic, ad-ready AI videos for your brand, product, or campaign. PKR 10,000 / second.'],
  ['02', 'AI Avatar / UGC-Style Videos', 'Realistic AI avatars that deliver your message like a real creator - perfect for social ads and UGC-style marketing. PKR 5,000 / second.'],
  ['03', 'AI Product & Lifestyle Images', 'High-quality AI-generated product photography and lifestyle shots, no camera crew needed. Custom pricing based on complexity.'],
  ['04', 'Full Social Content Packages', 'Videos, images, and avatars bundled into a ready-to-post content package for Instagram, TikTok, Facebook, and YouTube. Contact us for pricing.'],
]
const faqs = [
  ['What do you offer?', 'We create AI videos, AI avatars / UGC-style clips, product & lifestyle images, and full social content packages - for Instagram, TikTok, Facebook & YouTube.'],
  ['How much does it cost?', 'AI video content starts at PKR 10,000/second, and AI avatar/UGC videos are PKR 5,000/second. Images and full packages are custom-quoted based on what you need.'],
  ['How long does it take?', 'Turnaround depends on the project - some pieces are ready in a couple of days, bigger campaigns take longer. Tell us what you need and we\'ll give you a timeline.'],
  ['Do I need to pay upfront?', 'It depends on the project - sometimes we ask for an advance, sometimes not. Our team will confirm this with you directly.'],
  ['What if I don\'t like the result?', 'No worries - we do unlimited revisions until you\'re 100% happy with the final content.'],
  ['Who owns the content after it\'s done?', 'You do! Once delivered, you get full ownership with unlimited commercial usage rights.'],
  ['Can I see past work?', 'Yes! We\'ve worked with local businesses like bakeries, streetwear brands, and home décor stores. Reach out and we\'ll send samples.'],
]
const quotes = [
  ['\"Antiframer turned our bakery launch into a full social campaign in three days. The AI video looked like it came from a real studio.\"', 'Ayesha R.', 'Founder, Sugar & Spice Bakery'],
  ['\"The avatar UGC clip they made for our streetwear drop got more engagement than anything we\'d ever run. Mind-blowing.\"', 'Bilal K.', 'Brand Lead, Threadline'],
  ['\"They understood the Pakistani market better than any agency we\'d worked with before. Bold, fast, affordable.\"', 'Sana M.', 'Co-founder, Nest & Co.'],
]

const DEMO_BASE = 'https://qunmardnapopzywrqonb.supabase.co/storage/v1/object/public/demo%20vides'
const demoVideos: { src: string; label: string; orient: 'landscape' | 'portrait'; hero?: boolean }[] = [
  { src: `${DEMO_BASE}/sample7.mp4`,     label: 'Brand Film 01', orient: 'landscape' },
  { src: `${DEMO_BASE}/sample1.mp4`,     label: 'UGC Clip 01', orient: 'portrait'  },
  { src: `${DEMO_BASE}/sample4.mp4`,     label: 'Avatar Video', orient: 'portrait'  },
  { src: `${DEMO_BASE}/sample6.mp4`,     label: 'Product Ad', orient: 'portrait'  },
  { src: `${DEMO_BASE}/sample16.mp4`,    label: 'Lifestyle Shot', orient: 'portrait'  },
  { src: `${DEMO_BASE}/Demo1%20(2).mp4`, label: 'Campaign 02', orient: 'landscape' },
  { src: `${DEMO_BASE}/sample13.mp4`,    label: 'Short Form', orient: 'portrait'  },
  { src: `${DEMO_BASE}/Demo2%20(3).mp4`, label: 'Hero Reel', orient: 'landscape', hero: true },
]

function DemoVideo({ src, label, orient, hero, delay, isSolo, onSolo }: {
  src: string
  label: string
  orient: 'landscape' | 'portrait'
  hero?: boolean
  delay: number
  isSolo: boolean
  onSolo: (el: HTMLVideoElement | null) => void
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLElement>(null)
  const [aspect, setAspect] = useState<'landscape' | 'portrait'>('portrait')

  useEffect(() => {
    const v = ref.current
    const wrap = wrapRef.current
    if (!v || !wrap) return

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          v.play().catch(() => {})
        } else {
          v.pause()
        }
      })
    }, { threshold: 0.2 })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!isSolo && ref.current && !ref.current.muted) {
      ref.current.muted = true
    }
  }, [isSolo])

  const toggleSound = () => {
    const v = ref.current
    if (!v) return
    if (v.muted) {
      v.muted = false
      v.play().catch(() => {})
      onSolo(v)
    } else {
      v.muted = true
      onSolo(null)
    }
  }

  return (
    <figure
      ref={wrapRef}
      className={`demo-cell${hero ? ' demo-cell--hero' : ''}`}
      data-orient={aspect}
      data-sound={isSolo || undefined}
      data-reveal
      data-reveal-delay={delay}
      onClick={toggleSound}
      role="button"
      aria-label={`${label} - click to ${isSolo ? 'mute' : 'unmute'}`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSound() } }}
    >
      <div className="demo-frame">
        <video
          ref={ref}
          src={src}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            setAspect(v.videoWidth >= v.videoHeight ? 'landscape' : 'portrait')
          }}
        />
        <span className="demo-sound-badge" aria-hidden="true">Sound</span>
      </div>
      <figcaption className="demo-meta">
        <span>{label}</span>
        <span>{aspect === 'landscape' ? '16:9' : '9:16'}</span>
      </figcaption>
    </figure>
  )
}

export default function Page() {
  const [menu, setMenu] = useState(false)
  const [service, setService] = useState(0)
  const [faq, setFaq] = useState<number | null>(0)
  const [quote, setQuote] = useState(0)
  const [soloVideo, setSoloVideo] = useState<HTMLVideoElement | null>(null)

  useEffect(() => {
    const words = document.querySelectorAll('.quote-copy blockquote .word:not(.is-visible)')
    if (!words.length) return
    const raf = requestAnimationFrame(() => {
      words.forEach((w) => w.classList.add('is-visible'))
    })
    return () => cancelAnimationFrame(raf)
  }, [quote])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const els = document.querySelectorAll('[data-reveal], .word')

    if (reduceMotion.matches) {
      els.forEach((el) => el.classList.add('is-visible'))
      document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
        const t = Number(el.dataset.target || '0')
        el.textContent = String(t).padStart(2, '0')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))

    const counters = new Map<HTMLElement, { target: number; start: number | null }>()
    const armed = new Map<HTMLElement, MutationObserver>()
    document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
      const parent = el.closest('[data-reveal]')
      if (!parent) return
      counters.set(el, { target: Number(el.dataset.target || '0'), start: null })
      const arm = new MutationObserver(() => {
        if (parent.classList.contains('is-visible')) {
          counters.get(el)!.start = performance.now()
          arm.disconnect()
          armed.delete(el)
        }
      })
      arm.observe(parent, { attributes: true, attributeFilter: ['class'] })
      armed.set(el, arm)
    })

    let raf = 0
    const root = document.documentElement
    const tick = (now: number) => {
      const y = window.scrollY
      const max = Math.max(1, root.scrollHeight - window.innerHeight)
      root.style.setProperty('--scroll-y', String(y))
      root.style.setProperty('--scroll-progress', String(Math.min(1, y / max)))

      counters.forEach(({ target, start }, el) => {
        if (start === null) return
        const t = Math.min(1, (now - start) / 900)
        const eased = 1 - Math.pow(1 - t, 3)
        el.textContent = String(Math.round(target * eased)).padStart(2, '0')
        if (t >= 1) counters.delete(el)
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      armed.forEach((arm) => arm.disconnect())
    }
  }, [])

  return <main>
    <header className="nav">
      <a className="brand logo-brand" href="#top" aria-label="Antiframer home">
        <img src="/echoks-logo.png" alt="Antiframer logo" />
      </a>
      <nav className="nav-links">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#packages">Packages</a>
        <a href="/blog">Journal</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="nav-actions">
        <button className="menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu}>
          {menu ? 'Close' : 'Menu'}
        </button>
      </div>
    </header>
    {menu && <div className="mobile-menu">
      <a href="#work" onClick={() => setMenu(false)}>Work</a>
      <a href="#about" onClick={() => setMenu(false)}>About</a>
      <a href="#services" onClick={() => setMenu(false)}>Services</a>
      <a href="#packages" onClick={() => setMenu(false)}>Packages</a>
      <a href="/blog" onClick={() => setMenu(false)}>Journal</a>
      <a href="#contact" onClick={() => setMenu(false)}>Contact</a>
      <p>Scroll-stopping AI content for Pakistan.</p>
    </div>}

    <section id="top" className="hero"><div className="hero-top" data-reveal="fade"><span>AI-Powered Creative Studio</span><span>Karachi, Pakistan</span></div><div className="hero-copy"><p className="eyebrow" data-reveal data-reveal-delay="0">Hello, we're Antiframer</p><h1><span data-reveal data-reveal-delay="100" style={{display:'inline-block'}}>Bold content</span><br /><em data-reveal data-reveal-delay="200" style={{display:'inline-block'}}>that hits</em><span data-reveal data-reveal-delay="300" style={{display:'inline-block'}}> harder.</span></h1><div style={{display:"flex",gap:"16px",alignItems:"center"}} data-reveal data-reveal-delay="350">
        <a className="outline-button" href="#contact" style={{borderColor:"#fff",color:"#fff"}}>Get a Quote <span>↗</span></a>
        <a className="outline-button" href="https://wa.me/923118447722" target="_blank" rel="noopener noreferrer" style={{borderColor:"#fff",color:"#fff"}}>WhatsApp <span>↗</span></a>
        <a className="circle-arrow" href="#about" aria-label="Scroll to about" style={{margin:0}}>↘</a>
      </div></div><div className="hero-visual"><div className="scanlines" /><img src={portrait} alt="Portrait on a vivid red background" /></div><div className="hero-bottom" data-reveal="fade"><span>Scroll to explore</span><span className="hero-dot" /><span>Videos / Avatars / Images</span></div></section>

    <section className="ticker" aria-label="Studio principles"><div className="ticker-track">SCROLL-STOPPING CONTENT <span>✳</span> NO STUDIO SHOTS <span>✳</span> PKR PRICING <span>✳</span> SCROLL-STOPPING CONTENT <span>✳</span> NO STUDIO SHOTS <span>✳</span> PKR PRICING <span>✳</span></div></section>

    <section id="about" className="manifesto"><div className="section-label" data-reveal data-reveal-delay="0">01 / About us</div><div className="manifesto-content"><h2 data-reveal data-reveal-delay="100">AI content built for the <span className="highlight">Pakistani market.</span></h2><p data-reveal data-reveal-delay="200">Antiframer is a Karachi-based AI creative agency building the next generation of content for local businesses. We combine cutting-edge AI video and image generation with a sharp creative eye to deliver ad-ready content fast - at a fraction of traditional production cost.</p><a className="text-link" href="#contact" data-reveal data-reveal-delay="300">More about us <span>↗</span></a></div><img className="rocket" src={rocket} alt="Animated rocket" /></section>

    <section id="work" className="work" data-reveal><div className="section-head"><div className="section-label">02 / Our work</div><p>A few things we've made<br />for real Pakistani brands.</p></div><div className="project-grid"><article className="project project-one" data-reveal data-reveal-delay="0"><div className="project-art art-sun"><span>SUGAR<br />& SPICE</span></div><div className="project-meta"><h3>Sugar & Spice</h3><span>AI ad video + product photos</span></div></article><article className="project project-two" data-reveal data-reveal-delay="100"><div className="project-art art-black"><span>THREAD<br /><i>line</i></span></div><div className="project-meta"><h3>Threadline</h3><span>Full content package for drop day</span></div></article><article className="project project-three" data-reveal data-reveal-delay="200"><div className="project-art art-lime"><span>NEST<br />& CO.</span><img src={golf} alt="Animated detail" /></div><div className="project-meta"><h3>Nest & Co.</h3><span>Cinematic brand explainer</span></div></article></div><a className="outline-button" href="#contact">See all work <span>↗</span></a></section>

    <section className="gallery-section" data-reveal="scale"><div className="section-head"><div className="section-label">02.5 / In motion</div><p>The work, mid-flight -<br />drag or scroll through it.</p></div><div className="gallery-frame"><CircularGalleryDynamic items={galleryItems} bend={3} textColor="#111111" borderRadius={0.05} scrollSpeed={2.5} scrollEase={0.04} /></div></section>

    <section id="services" className="services"><div className="section-label" data-reveal data-reveal-delay="0">03 / What we do</div><div className="services-main"><h2 data-reveal data-reveal-delay="100">Content that<br /><span>works,</span><br />not just looks.</h2><div className="service-list" data-reveal data-reveal-delay="100">{services.map(([num, title, body], index) => <div className={`service-item ${service === index ? 'active' : ''}`} key={title}><button onClick={() => setService(service === index ? -1 : index)} aria-expanded={service === index}><span>{num}</span><strong>{title}</strong><b>{service === index ? '−' : '+'}</b></button><p className="service-body">{body}</p></div>)}</div></div></section>

    <section id="packages" className="demo-reel"><div className="section-head"><div className="section-label" data-reveal data-reveal-delay="0">04 / Packages</div><p>Bundled for impact.<br />Pick what fits your goals.</p></div><div className="demo-grid"><div className="demo-cell demo-cell--hero" data-reveal data-reveal-delay="0"><div className="demo-frame" style={{aspectRatio:'21/9', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'20px', padding:'40px'}}><table style={{width:'100%', borderCollapse:'collapse', color:'#fff', fontSize:'clamp(12px,1.5vw,18px)', fontFamily:'Inter,sans-serif'}}><thead><tr style={{borderBottom:'1px solid var(--border)'}}><th style={{textAlign:'left',padding:'10px 16px',color:'var(--red)',textTransform:'uppercase',letterSpacing:'.1em',fontSize:'10px'}}>Package</th><th style={{textAlign:'left',padding:'10px 16px',textTransform:'uppercase',letterSpacing:'.1em',fontSize:'10px'}}>Includes</th><th style={{textAlign:'left',padding:'10px 16px',textTransform:'uppercase',letterSpacing:'.1em',fontSize:'10px'}}>Best For</th></tr></thead><tbody><tr style={{borderBottom:'1px solid var(--border)'}}><td style={{padding:'14px 16px',fontWeight:800,letterSpacing:'-.04em'}}>Starter</td><td style={{padding:'14px 16px',color:'var(--muted)'}}>3 AI images + 10-sec ad video</td><td style={{padding:'14px 16px',color:'var(--muted)'}}>Small businesses testing AI content</td></tr><tr style={{borderBottom:'1px solid var(--border)'}}><td style={{padding:'14px 16px',fontWeight:800,letterSpacing:'-.04em'}}>Growth</td><td style={{padding:'14px 16px',color:'var(--muted)'}}>6 images + 20-sec video + 1 avatar UGC clip</td><td style={{padding:'14px 16px',color:'var(--muted)'}}>Businesses running social ads</td></tr><tr><td style={{padding:'14px 16px',fontWeight:800,letterSpacing:'-.04em'}}>Full Campaign</td><td style={{padding:'14px 16px',color:'var(--muted)'}}>10+ images + 30-sec video + 2 avatar clips + content calendar</td><td style={{padding:'14px 16px',color:'var(--muted)'}}>Brands wanting a full monthly push</td></tr></tbody></table><p style={{color:'var(--muted)',fontSize:'12px',marginTop:'8px'}}>Exact pricing on request - contact us for a custom quote.</p></div></div></div></section>

    <section className="quote-section"><div className="quote-image" data-reveal="slide-right"><img src={ceo} alt="Portrait of a creative leader" /></div><div className="quote-copy"><span className="eyebrow" data-reveal="slide-left" data-reveal-delay="0">What clients say</span><blockquote key={quote}>{quotes[quote][0].split(/\s+/).map((w, i, arr) => <span key={i} className="word" style={{ transitionDelay: `${i * 30}ms` }}>{w}{i < arr.length - 1 ? ' ' : ''}</span>)}</blockquote><p className="quote-by" data-reveal="slide-left" data-reveal-delay="200">{quotes[quote][1]}<br /><span>{quotes[quote][2]}</span></p><div className="quote-controls" data-reveal="slide-left" data-reveal-delay="300"><button onClick={() => setQuote((quote + quotes.length - 1) % quotes.length)} aria-label="Previous quote">←</button><span>0{quote + 1} / 0{quotes.length}</span><button onClick={() => setQuote((quote + 1) % quotes.length)} aria-label="Next quote">→</button></div></div></section>

    <section className="numbers"><div className="section-label" data-reveal data-reveal-delay="0">05 / Why Antiframer</div><div className="numbers-grid"><div data-reveal data-reveal-delay="0"><strong data-counter data-target="10000">00</strong><span>PKR per sec - starting price</span></div><div data-reveal data-reveal-delay="100"><strong className="infinity">∞</strong><span>Revisions included</span></div><div data-reveal data-reveal-delay="200"><strong>100%</strong><span>Commercial ownership</span></div></div></section>

    <section className="demo-reel"><div className="section-head"><div className="section-label" data-reveal data-reveal-delay="0">06 / Demo reel</div><p>Proof, playing.<br />Tap any film for sound.</p></div><div className="demo-grid">{demoVideos.map((v, i) => <DemoVideo key={v.src} src={v.src} label={v.label} orient={v.orient} hero={v.hero} delay={(i % 3) * 100} isSolo={soloVideo !== null && soloVideo?.src === v.src} onSolo={setSoloVideo} />)}</div></section>

    <section className="faq"><div className="section-label" data-reveal data-reveal-delay="0">07 / Frequently asked</div><div className="faq-content"><h2 data-reveal data-reveal-delay="100">Questions,<br /><span>answered.</span></h2><div className="faq-list" data-reveal data-reveal-delay="100">{faqs.map(([q, a], index) => <div className={`faq-item ${faq === index ? 'active' : ''}`} key={q}><button onClick={() => setFaq(faq === index ? null : index)} aria-expanded={faq === index}><span>{q}</span><b>{faq === index ? '−' : '+'}</b></button><p className="faq-answer">{a}</p></div>)}</div></div></section>

    <section id="contact" className="cta" data-reveal="scale"><div className="cta-pattern" /><span className="eyebrow" data-reveal data-reveal-delay="0">Have a project in mind?</span><h2><span data-reveal data-reveal-delay="0" style={{display:'inline-block'}}>Let's make</span><br /><em data-reveal data-reveal-delay="120" style={{display:'inline-block'}}>something</em><br /><span data-reveal data-reveal-delay="240" style={{display:'inline-block'}}>matter.</span></h2><div style={{display:"flex",gap:"16px",flexWrap:"wrap",marginTop:"48px",position:"relative",zIndex:2}} data-reveal data-reveal-delay="350">
        <a className="outline-button" href="https://wa.me/923118447722" target="_blank" rel="noopener noreferrer" style={{borderColor:"#fff",color:"#fff"}}>WhatsApp Us <span>↗</span></a>
        <a className="outline-button" href="mailto:hello@antiframer.com" style={{borderColor:"#fff",color:"#fff"}}>Email Us <span>↗</span></a>
      </div><div className="cta-bottom" data-reveal="fade" data-reveal-delay="400"><span>0311 8447722</span><span>hello@antiframer.com</span></div></section>
    <footer><div className="footer-brand">Anti<br />framer®</div><div className="footer-links"><a href="#top">Back to top ↑</a><a href="https://wa.me/923118447722" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a><a href="mailto:hello@antiframer.com">Email ↗</a></div><small>© 2026 Antiframer. All rights reserved.</small></footer>
  </main>
}
