'use client'

import { useEffect, useState } from 'react'
import CircularGallery from '@/components/CircularGallery'

const galleryItems = [
  { image: 'https://picsum.photos/seed/studio-1/1000/800', text: 'Common Ground' },
  { image: 'https://picsum.photos/seed/studio-2/1000/800', text: 'Good for Nothing' },
  { image: 'https://picsum.photos/seed/studio-3/1000/800', text: 'Move Your Mind' },
  { image: 'https://picsum.photos/seed/studio-4/1000/800', text: 'Assembly' },
  { image: 'https://picsum.photos/seed/studio-5/1000/800', text: 'North Star' },
  { image: 'https://picsum.photos/seed/studio-6/1000/800', text: 'Bright Flag' },
]

const portrait = 'https://cdn.prod.website-files.com/682ade213ae3efdb0cc737cd/69d931e1d30c806ac265cfd8_Frame%202085666965-p-1600.png'
const ceo = 'https://cdn.prod.website-files.com/682ade213ae3efdb0cc737cd/6842f2166000b66353ad9dc9_Group%204.avif'
const rocket = 'https://cdn.prod.website-files.com/682ade213ae3efdb0cc737cd/682cce8a5b6d1ba1380422e0_giphy.gif'
const golf = 'https://cdn.prod.website-files.com/682ade213ae3efdb0cc737cd/682cf5d7d994371fae1d1367_giphy.gif'

const services = [
  ['01', 'Brand strategy', 'We define the sharp idea behind your brand, then turn it into a direction people remember.'],
  ['02', 'Visual identity', 'A distinctive visual language built to make every touchpoint feel unmistakably yours.'],
  ['03', 'Digital experiences', 'Websites and products that move with purpose, from first scroll to final click.'],
  ['04', 'Campaigns & content', 'Big, brave ideas that give your audience something worth talking about.'],
]
const faqs = [
  ['What does Anti Framer do?', 'We are an independent creative studio for ambitious brands. We bring strategy, design, technology, and storytelling together under one roof.'],
  ['How do you work with clients?', 'As a small senior team, we work closely with a limited number of partners at a time. The result is fast thinking, focused craft, and no layers between the idea and the work.'],
  ['Where are you based?', 'Everywhere, mostly. We are a remote-first studio with collaborators around the world.'],
  ['Can we work together?', 'Probably. Tell us what you are building and we will get back to you with a point of view.'],
]
const quotes = [
  ['“They understood the ambition immediately and made the whole thing feel easy. The work is bold, useful, and completely us.”', 'Maya Chen', 'Founder, Assembly'],
  ['“Anti Framer are the rare creative partner who can zoom out to the big idea and still obsess over the smallest detail.”', 'David Okafor', 'Brand Director, Good Company'],
  ['“The result did more than look good. It changed how our team talks about the brand, and how our customers see it.”', 'Sofia Williams', 'CEO, Common Ground'],
]

export default function Page() {
  const [menu, setMenu] = useState(false)
  const [cart, setCart] = useState(false)
  const [service, setService] = useState(0)
  const [faq, setFaq] = useState<number | null>(0)
  const [quote, setQuote] = useState(0)

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
      <a className="brand" href="#top" aria-label="Anti Framer home">Anti<br />Framer®</a>
      <nav className="nav-links"><a href="#work">Work</a><a href="#about">About</a><a href="#services">Services</a><a href="#contact">Contact</a></nav>
      <div className="nav-actions"><button className="cart-button" onClick={() => setCart(true)} aria-label="Open cart">Bag <span>0</span></button><button className="menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu}>{menu ? 'Close' : 'Menu'}</button></div>
    </header>
    {menu && <div className="mobile-menu"><a href="#work" onClick={() => setMenu(false)}>Work</a><a href="#about" onClick={() => setMenu(false)}>About</a><a href="#services" onClick={() => setMenu(false)}>Services</a><a href="#contact" onClick={() => setMenu(false)}>Contact</a><p>Available for a good idea.</p></div>}
    {cart && <div className="cart-drawer"><button className="drawer-close" onClick={() => setCart(false)}>Close ×</button><div><span className="eyebrow">Shop</span><h2>Nothing here<br />yet.</h2><p>We are working on something worth taking home.</p></div></div>}

    <section id="top" className="hero"><div className="hero-top" data-reveal="fade"><span>Independent creative studio</span><span>Based everywhere / 2025</span></div><div className="hero-copy"><p className="eyebrow" data-reveal data-reveal-delay="0">Hello, we’re Anti Framer</p><h1><span data-reveal data-reveal-delay="100" style={{display:'inline-block'}}>Ideas that</span><br /><em data-reveal data-reveal-delay="200" style={{display:'inline-block'}}>move</em><span data-reveal data-reveal-delay="300" style={{display:'inline-block'}}> people.</span></h1><a className="circle-arrow" href="#about" aria-label="Scroll to about" data-reveal data-reveal-delay="400">↘</a></div><div className="hero-visual"><div className="scanlines" /><img src={portrait} alt="Portrait on a vivid red background" /></div><div className="hero-bottom" data-reveal="fade"><span>Scroll to explore</span><span className="hero-dot" /><span>Strategy / Design / Culture</span></div></section>

    <section className="ticker" aria-label="Studio principles"><div className="ticker-track">MAKE IT MATTER <span>✳</span> MAKE IT MATTER <span>✳</span> MAKE IT MATTER <span>✳</span> MAKE IT MATTER <span>✳</span></div></section>

    <section id="about" className="manifesto"><div className="section-label" data-reveal data-reveal-delay="0">01 / A point of view</div><div className="manifesto-content"><h2 data-reveal data-reveal-delay="100">We make brands feel <span className="highlight">alive.</span></h2><p data-reveal data-reveal-delay="200">We are a creative studio for the restless, the curious, and the ones who know that the safest idea is rarely the right one. We turn a clear point of view into work people can feel.</p><a className="text-link" href="#contact" data-reveal data-reveal-delay="300">More about us <span>↗</span></a></div><img className="rocket" src={rocket} alt="Animated rocket" /></section>

    <section id="work" className="work" data-reveal><div className="section-head"><div className="section-label">02 / Selected work</div><p>A few things we’ve made<br />with good people.</p></div><div className="project-grid"><article className="project project-one" data-reveal data-reveal-delay="0"><div className="project-art art-sun"><span>COMMON<br />GROUND</span></div><div className="project-meta"><h3>Common Ground</h3><span>Brand identity / Digital</span></div></article><article className="project project-two" data-reveal data-reveal-delay="100"><div className="project-art art-black"><span>GOOD<br /><i>for</i><br />NOTHING</span></div><div className="project-meta"><h3>Good for Nothing</h3><span>Campaign / Culture</span></div></article><article className="project project-three" data-reveal data-reveal-delay="200"><div className="project-art art-lime"><span>MOVE<br />YOUR<br />MIND</span><img src={golf} alt="Animated golf ball" /></div><div className="project-meta"><h3>Move Your Mind</h3><span>Strategy / Experience</span></div></article></div><a className="outline-button" href="#contact">See all work <span>↗</span></a></section>

    <section className="gallery-section" data-reveal="scale"><div className="section-head"><div className="section-label">02.5 / In motion</div><p>The work, mid-flight —<br />drag or scroll through it.</p></div><div className="gallery-frame"><CircularGallery items={galleryItems} bend={3} textColor="#111111" borderRadius={0.05} scrollSpeed={2.5} scrollEase={0.04} /></div></section>

    <section id="services" className="services"><div className="section-label" data-reveal data-reveal-delay="0">03 / What we do</div><div className="services-main"><h2 data-reveal data-reveal-delay="100">Good work<br /><span>starts with</span><br />a good question.</h2><div className="service-list">{services.map(([num, title, body], index) => <div className={`service-item ${service === index ? 'active' : ''}`} key={title} data-reveal data-reveal-delay={String(index * 80)}><button onClick={() => setService(service === index ? -1 : index)}><span>{num}</span><strong>{title}</strong><b>{service === index ? '−' : '+'}</b></button>{service === index && <p>{body}</p>}</div>)}</div></div></section>

    <section className="quote-section"><div className="quote-image" data-reveal="slide-right"><img src={ceo} alt="Portrait of a creative leader" /></div><div className="quote-copy"><span className="eyebrow" data-reveal="slide-left" data-reveal-delay="0">A few nice words</span><blockquote key={quote}>{quotes[quote][0].split(/\s+/).map((w, i, arr) => <span key={i} className="word" style={{ transitionDelay: `${i * 30}ms` }}>{w}{i < arr.length - 1 ? ' ' : ''}</span>)}</blockquote><p className="quote-by" data-reveal="slide-left" data-reveal-delay="200">{quotes[quote][1]}<br /><span>{quotes[quote][2]}</span></p><div className="quote-controls" data-reveal="slide-left" data-reveal-delay="300"><button onClick={() => setQuote((quote + quotes.length - 1) % quotes.length)} aria-label="Previous quote">←</button><span>0{quote + 1} / 0{quotes.length}</span><button onClick={() => setQuote((quote + 1) % quotes.length)} aria-label="Next quote">→</button></div></div></section>

    <section className="numbers"><div className="section-label" data-reveal data-reveal-delay="0">04 / By the numbers</div><div className="numbers-grid"><div data-reveal data-reveal-delay="0"><strong data-counter data-target="17">00</strong><span>Brands launched</span></div><div data-reveal data-reveal-delay="100"><strong data-counter data-target="9">00</strong><span>Countries reached</span></div><div data-reveal data-reveal-delay="200"><strong className="infinity">∞</strong><span>Curiosity levels</span></div></div></section>

    <section className="faq"><div className="section-label" data-reveal data-reveal-delay="0">05 / Frequently asked</div><div className="faq-content"><h2 data-reveal data-reveal-delay="100">Questions,<br /><span>answered.</span></h2><div className="faq-list">{faqs.map(([q, a], index) => <div className="faq-item" key={q} data-reveal data-reveal-delay={String(index * 60)}><button onClick={() => setFaq(faq === index ? null : index)}><span>{q}</span><b>{faq === index ? '−' : '+'}</b></button>{faq === index && <p>{a}</p>}</div>)}</div></div></section>

    <section id="contact" className="cta" data-reveal="scale"><div className="cta-pattern" /><span className="eyebrow" data-reveal data-reveal-delay="0">Have a good idea?</span><h2><span data-reveal data-reveal-delay="0" style={{display:'inline-block'}}>Let’s make</span><br /><em data-reveal data-reveal-delay="120" style={{display:'inline-block'}}>something</em><br /><span data-reveal data-reveal-delay="240" style={{display:'inline-block'}}>matter.</span></h2><a className="circle-arrow dark" href="mailto:hello@antiframer.studio" aria-label="Email Anti Framer" data-reveal data-reveal-delay="400">↗</a><div className="cta-bottom" data-reveal="fade" data-reveal-delay="400"><span>hello@antiframer.studio</span><span>Available for 2025</span></div></section>
    <footer><div className="footer-brand">Anti<br />Framer®</div><div className="footer-links"><a href="#top">Back to top ↑</a><a href="#contact">Instagram ↗</a><a href="#contact">LinkedIn ↗</a></div><small>© 2025 Anti Framer. All rights reserved.</small></footer>
  </main>
}
