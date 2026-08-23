'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

const CircularGalleryDynamic = dynamic(
  () => import('@/components/CircularGallery').then((mod: { default: ComponentType<{ items?: Array<{ image: string; text: string }>; bend?: number; textColor?: string; borderRadius?: number; scrollSpeed?: number; scrollEase?: number }> }) => mod.default),
  { ssr: false, loading: () => <div className="gallery-frame" style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase' }}>Loading gallery…</div> }
)

const galleryItems = [
  { image: '/gallery/1.jpg', text: 'Mirror Muse' },
  { image: '/gallery/2.jpg', text: 'Ghost Writer' },
  { image: '/gallery/3.jpg', text: 'Dream Rotary' },
  { image: '/gallery/4.png', text: 'Latent Assembly' },
  { image: '/gallery/5.png', text: 'North Signal' },
  { image: '/gallery/6.png', text: 'Bright Model' },
]

const portrait = '/hero-portrait.png'
const ceo = '/ceo.avif'
const rocket = '/rocket.gif'
const golf = '/golf.gif'

const services = [
  ['01', 'AI brand systems', 'Strategy first. We define the sharp idea behind your brand, then build an AI-powered system that keeps it consistent everywhere.'],
  ['02', 'Generative identity', 'A living visual language — trained, tuned, and art-directed so every output feels unmistakably yours.'],
  ['03', 'Websites & AI products', 'Sites and products that pair human craft with intelligent systems, from first scroll to final prompt.'],
  ['04', 'AI campaigns & film', 'Bold concepts, generated at the speed of culture. Content, motion, and film your audience will actually talk about.'],
]
const faqs = [
  ['What does Anti Framer do?', 'We are an independent AI creative studio for ambitious brands. Strategy, generative design, film, and intelligent products — under one roof.'],
  ['How do you work with clients?', 'As a small senior team working alongside a tuned set of AI tools. Fast thinking, fast generation, slow craft on the parts that matter. No layers between the idea and the work.'],
  ['Where are you based?', 'Everywhere, mostly. We are a remote-first studio with collaborators around the world.'],
  ['Can we work together?', 'Probably. Tell us what you are building — human, machine, or both — and we will get back to you with a point of view.'],
]
const quotes = [
  ['“Anti Framer shipped in two weeks what our internal team had been blocked on for a year. It feels human, not generated.”', 'Maya Chen', 'Founder, Latent Assembly'],
  ['“The rare studio that treats AI as a collaborator, not a shortcut. Every frame, every word still has taste.”', 'David Okafor', 'Brand Director, Ghost Writer'],
  ['“They didn’t just give us an AI campaign. They changed how our whole team thinks about what’s possible.”', 'Sofia Williams', 'CEO, Mirror Muse'],
]

const DEMO_BASE = 'https://qunmardnapopzywrqonb.supabase.co/storage/v1/object/public/demo%20vides'
const demoVideos: { src: string; label: string; orient: 'landscape' | 'portrait'; hero?: boolean }[] = [
  { src: `${DEMO_BASE}/sample7.mp4`,     label: 'Film 01', orient: 'landscape' },
  { src: `${DEMO_BASE}/sample1.mp4`,     label: 'Film 02', orient: 'portrait'  },
  { src: `${DEMO_BASE}/sample4.mp4`,     label: 'Film 03', orient: 'portrait'  },
  { src: `${DEMO_BASE}/sample6.mp4`,     label: 'Film 04', orient: 'portrait'  },
  { src: `${DEMO_BASE}/sample16.mp4`,    label: 'Film 05', orient: 'portrait'  },
  { src: `${DEMO_BASE}/Demo1%20(2).mp4`, label: 'Film 06', orient: 'landscape' },
  { src: `${DEMO_BASE}/sample13.mp4`,    label: 'Film 07', orient: 'portrait'  },
  { src: `${DEMO_BASE}/Demo2%20(3).mp4`, label: 'Film 08', orient: 'landscape', hero: true },
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
  const [aspect, setAspect] = useState<'landscape' | 'portrait'>(orient)

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
      aria-label={`${label} — click to ${isSolo ? 'mute' : 'unmute'}`}
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
  const [cart, setCart] = useState(false)
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
      <a className="brand logo-brand" href="#top" aria-label="Echoks home"><img src="/echoks-logo.png" alt="Echoks logo" /></a>
      <nav className="nav-links"><a href="#work">Work</a><a href="#about">About</a><a href="#services">Services</a><a href="/blog">Journal</a><a href="#contact">Contact</a></nav>
      <div className="nav-actions"><button className="cart-button" onClick={() => setCart(true)} aria-label="Open cart">Bag <span>0</span></button><button className="menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu}>{menu ? 'Close' : 'Menu'}</button></div>
    </header>
    {menu && <div className="mobile-menu"><a href="#work" onClick={() => setMenu(false)}>Work</a><a href="#about" onClick={() => setMenu(false)}>About</a><a href="#services" onClick={() => setMenu(false)}>Services</a><a href="/blog" onClick={() => setMenu(false)}>Journal</a><a href="#contact" onClick={() => setMenu(false)}>Contact</a><p>Available for a good prompt.</p></div>}
    {cart && <div className="cart-drawer"><button className="drawer-close" onClick={() => setCart(false)}>Close ×</button><div><span className="eyebrow">Shop</span><h2>Nothing here<br />yet.</h2><p>We are training something worth taking home.</p></div></div>}

    <section id="top" className="hero"><div className="hero-top" data-reveal="fade"><span>Independent AI creative studio</span><span>Based everywhere / 2025</span></div><div className="hero-copy"><p className="eyebrow" data-reveal data-reveal-delay="0">Hello, we’re Anti Framer</p><h1><span data-reveal data-reveal-delay="100" style={{display:'inline-block'}}>Ideas that</span><br /><em data-reveal data-reveal-delay="200" style={{display:'inline-block'}}>out-think</em><span data-reveal data-reveal-delay="300" style={{display:'inline-block'}}> machines.</span></h1><a className="circle-arrow" href="#about" aria-label="Scroll to about" data-reveal data-reveal-delay="400">↘</a></div><div className="hero-visual"><div className="scanlines" /><img src={portrait} alt="Portrait on a vivid red background" /></div><div className="hero-bottom" data-reveal="fade"><span>Scroll to explore</span><span className="hero-dot" /><span>Strategy / AI / Craft</span></div></section>

    <section className="ticker" aria-label="Studio principles"><div className="ticker-track">MAKE IT MATTER <span>✳</span> MAKE IT MATTER <span>✳</span> MAKE IT MATTER <span>✳</span> MAKE IT MATTER <span>✳</span></div></section>

    <section id="about" className="manifesto"><div className="section-label" data-reveal data-reveal-delay="0">01 / A point of view</div><div className="manifesto-content"><h2 data-reveal data-reveal-delay="100">We make brands <span className="highlight">impossible to ignore.</span></h2><p data-reveal data-reveal-delay="200">We are a creative studio for the AI era. We pair human taste with machine speed — strategy, generative tools, and storytelling under one roof — to ship work that feels alive, not generated.</p><a className="text-link" href="#contact" data-reveal data-reveal-delay="300">More about us <span>↗</span></a></div><img className="rocket" src={rocket} alt="Animated rocket" /></section>

    <section id="work" className="work" data-reveal><div className="section-head"><div className="section-label">02 / Selected work</div><p>A few things we’ve made<br />with good people.</p></div><div className="project-grid"><article className="project project-one" data-reveal data-reveal-delay="0"><div className="project-art art-sun"><span>MIRROR<br />MUSE</span></div><div className="project-meta"><h3>Mirror Muse</h3><span>AI brand system / Generative</span></div></article><article className="project project-two" data-reveal data-reveal-delay="100"><div className="project-art art-black"><span>GHOST<br /><i>writer</i></span></div><div className="project-meta"><h3>Ghost Writer</h3><span>AI campaign / Culture</span></div></article><article className="project project-three" data-reveal data-reveal-delay="200"><div className="project-art art-lime"><span>DREAM<br />ROTARY</span><img src={golf} alt="Animated golf ball" /></div><div className="project-meta"><h3>Dream Rotary</h3><span>AI film / Experience</span></div></article></div><a className="outline-button" href="#contact">See all work <span>↗</span></a></section>

    <section className="gallery-section" data-reveal="scale"><div className="section-head"><div className="section-label">02.5 / In motion</div><p>The work, mid-flight —<br />drag or scroll through it.</p></div><div className="gallery-frame"><CircularGalleryDynamic items={galleryItems} bend={3} textColor="#111111" borderRadius={0.05} scrollSpeed={2.5} scrollEase={0.04} /></div></section>

    <section id="services" className="services"><div className="section-label" data-reveal data-reveal-delay="0">03 / What we do</div><div className="services-main"><h2 data-reveal data-reveal-delay="100">Good prompts<br /><span>start with</span><br />a good question.</h2><div className="service-list" data-reveal data-reveal-delay="100">{services.map(([num, title, body], index) => <div className={`service-item ${service === index ? 'active' : ''}`} key={title}><button onClick={() => setService(service === index ? -1 : index)} aria-expanded={service === index}><span>{num}</span><strong>{title}</strong><b>{service === index ? '−' : '+'}</b></button><p className="service-body">{body}</p></div>)}</div></div></section>

    <section className="quote-section"><div className="quote-image" data-reveal="slide-right"><img src={ceo} alt="Portrait of a creative leader" /></div><div className="quote-copy"><span className="eyebrow" data-reveal="slide-left" data-reveal-delay="0">A few nice words</span><blockquote key={quote}>{quotes[quote][0].split(/\s+/).map((w, i, arr) => <span key={i} className="word" style={{ transitionDelay: `${i * 30}ms` }}>{w}{i < arr.length - 1 ? ' ' : ''}</span>)}</blockquote><p className="quote-by" data-reveal="slide-left" data-reveal-delay="200">{quotes[quote][1]}<br /><span>{quotes[quote][2]}</span></p><div className="quote-controls" data-reveal="slide-left" data-reveal-delay="300"><button onClick={() => setQuote((quote + quotes.length - 1) % quotes.length)} aria-label="Previous quote">←</button><span>0{quote + 1} / 0{quotes.length}</span><button onClick={() => setQuote((quote + 1) % quotes.length)} aria-label="Next quote">→</button></div></div></section>

    <section className="numbers"><div className="section-label" data-reveal data-reveal-delay="0">04 / By the numbers</div><div className="numbers-grid"><div data-reveal data-reveal-delay="0"><strong data-counter data-target="17">00</strong><span>AI brands launched</span></div><div data-reveal data-reveal-delay="100"><strong data-counter data-target="9">00</strong><span>Countries reached</span></div><div data-reveal data-reveal-delay="200"><strong className="infinity">∞</strong><span>Curiosity levels</span></div></div></section>

    <section className="demo-reel"><div className="section-head"><div className="section-label" data-reveal data-reveal-delay="0">05 / Demo reel</div><p data-reveal data-reveal-delay="100">Proof, playing.<br />Tap any film for sound.</p></div><div className="demo-grid">{demoVideos.map((v, i) => <DemoVideo key={v.src} src={v.src} label={v.label} orient={v.orient} hero={v.hero} delay={(i % 3) * 100} isSolo={soloVideo !== null && soloVideo?.src === v.src} onSolo={setSoloVideo} />)}</div></section>

    <section className="faq"><div className="section-label" data-reveal data-reveal-delay="0">06 / Frequently asked</div><div className="faq-content"><h2 data-reveal data-reveal-delay="100">Questions,<br /><span>answered.</span></h2><div className="faq-list" data-reveal data-reveal-delay="100">{faqs.map(([q, a], index) => <div className={`faq-item ${faq === index ? 'active' : ''}`} key={q}><button onClick={() => setFaq(faq === index ? null : index)} aria-expanded={faq === index}><span>{q}</span><b>{faq === index ? '−' : '+'}</b></button><p className="faq-answer">{a}</p></div>)}</div></div></section>

    <section id="contact" className="cta" data-reveal="scale"><div className="cta-pattern" /><span className="eyebrow" data-reveal data-reveal-delay="0">Have a good idea?</span><h2><span data-reveal data-reveal-delay="0" style={{display:'inline-block'}}>Let’s make</span><br /><em data-reveal data-reveal-delay="120" style={{display:'inline-block'}}>something</em><br /><span data-reveal data-reveal-delay="240" style={{display:'inline-block'}}>matter.</span></h2><a className="circle-arrow dark" href="mailto:hello@antiframer.studio" aria-label="Email Anti Framer" data-reveal data-reveal-delay="400">↗</a><div className="cta-bottom" data-reveal="fade" data-reveal-delay="400"><span>hello@antiframer.studio</span><span>Available for 2025</span></div></section>
    <footer><div className="footer-brand">Anti<br />Framer®</div><div className="footer-links"><a href="#top">Back to top ↑</a><a href="#contact">Instagram ↗</a><a href="#contact">LinkedIn ↗</a></div><small>© 2025 Anti Framer. All rights reserved.</small></footer>
  </main>
}
