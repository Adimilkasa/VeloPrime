import './style.css'

function prefersReducedMotion() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

function setupScrollReveal() {
  const nodes = Array.from(document.querySelectorAll('[data-reveal]'))
  if (!nodes.length) return
  if (prefersReducedMotion()) {
    for (const node of nodes) node.classList.add('is-visible')
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    },
    {
      root: null,
      threshold: 0.15,
    },
  )

  for (const node of nodes) observer.observe(node)
}

function setupMobileNav() {
  const toggle = document.querySelector('.nav-toggle')
  const links = document.querySelector('#nav-links')
  if (!toggle || !links) return

  const close = () => {
    links.classList.remove('is-open')
    toggle.setAttribute('aria-expanded', 'false')
  }

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open')
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
  })

  links.addEventListener('click', (e) => {
    const target = e.target
    if (target && target.tagName === 'A') close()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })

  document.addEventListener('click', (e) => {
    const target = e.target
    if (!links.classList.contains('is-open')) return
    if (target instanceof Node && (links.contains(target) || toggle.contains(target))) return
    close()
  })
}

function setupFooterYear() {
  const node = document.querySelector('[data-year]')
  if (!node) return
  node.textContent = String(new Date().getFullYear())
}

function setupContactForm() {
  const form = document.querySelector('[data-contact-form]')
  const status = document.querySelector('[data-form-status]')
  if (!form) return

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const message = String(data.get('message') || '').trim()

    if (!name || !email || !message) {
      if (status) status.textContent = 'Uzupełnij wszystkie pola.'
      return
    }

    const subject = encodeURIComponent(`Zapytanie ze strony  ${name}`)
    const body = encodeURIComponent(`Imię: ${name}\nEmail: ${email}\n\nWiadomość:\n${message}`)

    // Zmień na swój adres docelowy
    const to = 'hello@example.com'
    const href = `mailto:${to}?subject=${subject}&body=${body}`

    if (status) status.textContent = 'Otwieram aplikację pocztową'
    window.location.href = href
  })
}

setupMobileNav()
setupFooterYear()
setupContactForm()
setupScrollReveal()
