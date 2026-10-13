import { useEffect, useRef, useState } from "react"

const DUA_STORE_URL = "https://api.npoint.io/8876c2d4a0ef92e09588"
const EMAILJS_SERVICE_ID = "service_d74ux2e"
const EMAILJS_TEMPLATE_ID = "template_6im52p8"
const EMAILJS_PUBLIC_KEY = "scebGx3sGrZxR0Hbh"

function Monogram({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? "monogram-mark compact" : "monogram-mark"}
      viewBox="0 0 120 120"
      role="img"
      aria-label="IA wedding monogram"
    >
      <circle cx="60" cy="60" r="55" />
      <path d="M24 60c9-6 16-15 20-28v56c-4-13-11-22-20-28Z" />
      <path d="M55 87 73 33 91 87M62 68h22" />
      <path
        className="monogram-flourish"
        d="M38 92c14 9 30 9 44 0M38 28c14-9 30-9 44 0"
      />
    </svg>
  )
}

function ArchOrnament() {
  return (
    <svg
      aria-hidden="true"
      className="arch-ornament"
      viewBox="0 0 120 70"
      fill="none"
    >
      <path d="M1 69C5 31 25 10 60 1c35 9 55 30 59 68" />
      <path d="M15 69C18 40 33 23 60 14c27 9 42 26 45 55" />
      <path d="M60 1v13M22 36l11 7M98 36l-11 7" />
    </svg>
  )
}

function InvitationOpening({ onComplete }: { onComplete: () => void }) {
  const [opening, setOpening] = useState(false)

  const openInvitation = () => {
    if (opening) return
    setOpening(true)
    window.setTimeout(onComplete, 700)
  }

  return (
    <div
      className={`opening ${opening ? "is-opening" : ""}`}
      onClick={openInvitation}
    >
      <div className="opening-pattern" />
      <div className="opening-arch">
        <Monogram />
        <p>In the name of Allah</p>
        <span>You are invited to celebrate</span>
        <strong>Iffath Unnisa & Abdul Waseem Mohammed</strong>
      </div>
      <button type="button" onClick={openInvitation}>
        Tap anywhere to open
      </button>
    </div>
  )
}

function AudioExperience() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const userPaused = useRef(false)

  const toggleSoundscape = () => {
    const audio = audioElement.current
    if (!audio) return

    if (!audio.paused) {
      userPaused.current = true
      audio.pause()
      setIsPlaying(false)
      return
    }

    userPaused.current = false
    void audio.play().then(() => setIsPlaying(true))
  }

  useEffect(() => {
    const audio = audioElement.current
    if (!audio) return

    audio.volume = 0.38

    const attemptPlay = () => {
      if (userPaused.current) return
      void audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }

    const autoplayTimer = window.setTimeout(() => {
      attemptPlay()
    }, 500)

    const unlockAutoplay = (event: Event) => {
      const target = event.target
      if (target instanceof Element && target.closest(".audio-player")) return
      attemptPlay()
    }
    const markPlaying = () => setIsPlaying(true)
    const markPaused = () => setIsPlaying(false)

    window.addEventListener("pointerdown", unlockAutoplay)
    window.addEventListener("keydown", unlockAutoplay)
    audio.addEventListener("play", markPlaying)
    audio.addEventListener("pause", markPaused)

    return () => {
      window.clearTimeout(autoplayTimer)
      window.removeEventListener("pointerdown", unlockAutoplay)
      window.removeEventListener("keydown", unlockAutoplay)
      audio.removeEventListener("play", markPlaying)
      audio.removeEventListener("pause", markPaused)
      audio.pause()
    }
  }, [])

  return (
    <aside className={`audio-player ${isPlaying ? "playing" : ""}`}>
      <audio
        ref={audioElement}
        src={`${import.meta.env.BASE_URL}audio/bismillah-instrumental.mp3`}
        loop
        preload="auto"
      />
      <div className="audio-visual" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <button
        type="button"
        onClick={toggleSoundscape}
        aria-pressed={isPlaying}
        aria-label={
          isPlaying ? "Pause wedding soundscape" : "Play wedding soundscape"
        }
      >
        {isPlaying ? "Pause audio" : "Play audio"}
      </button>
    </aside>
  )
}

function RsvpForm() {
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [attendance, setAttendance] = useState("Joyfully attending")
  const [celebration, setCelebration] = useState("Both")
  const [guestCount, setGuestCount] = useState("1")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [isSending, setIsSending] = useState(false)

  const celebrationSummary =
    celebration === "Both"
      ? "Nikah Ceremony and Reception"
      : celebration.startsWith("Nikah")
        ? "Nikah Ceremony"
        : "Reception"

  const submitRsvp = async (event: React.FormEvent) => {
    event.preventDefault()

    setIsSending(true)
    setStatus("Sending your RSVP...")

    try {
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: {
              guest_name: guestName,
              guest_email: guestEmail,
              guest_phone: guestPhone || "Not provided",
              attendance,
              events:
                attendance === "Joyfully attending"
                  ? celebrationSummary
                  : "Not attending",
              guest_count:
                attendance === "Joyfully attending" ? guestCount : "0",
              message: message || "No additional message",
            },
          }),
        },
      )

      if (!response.ok) throw new Error("Unable to send RSVP")

      setStatus("Thank you. A confirmation has been sent to your email.")
      setGuestName("")
      setGuestEmail("")
      setGuestPhone("")
      setAttendance("Joyfully attending")
      setCelebration("Both")
      setGuestCount("1")
      setMessage("")
    } catch {
      setStatus(
        "We could not send your RSVP. Please check your details and try again.",
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="rsvp" id="rsvp">
      <div className="rsvp-intro" data-reveal>
        <p className="section-kicker">Kindly respond</p>
        <h2 data-reveal="title">Will you celebrate with us?</h2>
        <p>
          We would be honored by your presence. Please let us know if you will
          be joining us for either or both celebrations.
        </p>
        <div className="rsvp-dates">
          <span>14</span>
          <p>
            November 2026
            <br />
            Nikah Ceremony
          </p>
          <i />
          <span>15</span>
          <p>
            November 2026
            <br />
            Reception
          </p>
        </div>
      </div>

      <form className="rsvp-form" onSubmit={submitRsvp} data-reveal>
        <div className="field-row">
          <label>
            <span>Your name</span>
            <input
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              required
              maxLength={80}
              placeholder="Guest name"
            />
          </label>
          <label>
            <span>Email address</span>
            <input
              type="email"
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              required
              placeholder="name@email.com"
            />
          </label>
        </div>

        <div className="field-row">
          <label>
            <span>Phone number</span>
            <input
              type="tel"
              value={guestPhone}
              onChange={(event) => setGuestPhone(event.target.value)}
              placeholder="Optional"
            />
          </label>
          <label>
            <span>Number of guests</span>
            <select
              value={guestCount}
              onChange={(event) => setGuestCount(event.target.value)}
              disabled={attendance !== "Joyfully attending"}
            >
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend>Will you be attending?</legend>
          <div className="choice-row">
            {["Joyfully attending", "Unable to attend"].map((choice) => (
              <label className="choice" key={choice}>
                <input
                  type="radio"
                  name="attendance"
                  value={choice}
                  checked={attendance === choice}
                  onChange={(event) => setAttendance(event.target.value)}
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {attendance === "Joyfully attending" && (
          <fieldset>
            <legend>Which celebration will you attend?</legend>
            <div className="choice-row">
              {[
                "Nikah Ceremony — November 14",
                "Reception — November 15",
                "Both",
              ].map((choice) => (
                <label className="choice" key={choice}>
                  <input
                    type="radio"
                    name="celebration"
                    value={choice}
                    checked={celebration === choice}
                    onChange={(event) => setCelebration(event.target.value)}
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="message-field">
          <span>A message for the couple</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Share a note, prayer, or warm wishes for the couple."
          />
        </label>

        <div className="rsvp-submit">
          <button type="submit" disabled={isSending}>
            {isSending ? "Sending RSVP..." : "Send RSVP"}
          </button>
          <span role="status">{status}</span>
        </div>
      </form>
    </section>
  )
}

type GuestMessage = {
  id: number
  name: string
  message: string
}

function Guestbook() {
  const [messages, setMessages] = useState<GuestMessage[]>([])
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("Loading shared blessings...")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(DUA_STORE_URL)
        if (!response.ok) throw new Error("Unable to load duas")
        const data = (await response.json()) as { duas?: GuestMessage[] }
        const savedMessages = Array.isArray(data.duas) ? data.duas : []
        setMessages(savedMessages)
        setStatus(
          savedMessages.length === 0
            ? "Be the first to leave a beautiful blessing."
            : `${savedMessages.length} shared blessing${
                savedMessages.length === 1 ? "" : "s"
              }`,
        )
      } catch {
        setStatus("Shared blessings are temporarily unavailable.")
      }
    }

    void loadMessages()
  }, [])

  const addMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !message.trim() || isSubmitting) return

    setIsSubmitting(true)
    setStatus("Sharing your blessing...")

    try {
      const latestResponse = await fetch(DUA_STORE_URL)
      const latestData = latestResponse.ok
        ? (await latestResponse.json()) as { duas?: GuestMessage[] }
        : { duas: messages }
      const latestMessages = Array.isArray(latestData.duas)
        ? latestData.duas
        : messages
      const next = [
        { id: Date.now(), name: name.trim(), message: message.trim() },
        ...latestMessages,
      ].slice(0, 50)

      const saveResponse = await fetch(DUA_STORE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duas: next }),
      })
      if (!saveResponse.ok) throw new Error("Unable to save dua")

      setMessages(next)
      setName("")
      setMessage("")
      setStatus("Your blessing is now visible to everyone.")
    } catch {
      setStatus("Your blessing could not be saved. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="guestbook" id="guestbook">
      <div className="guestbook-heading" data-reveal>
        <p className="section-kicker">A gift from the heart</p>
        <h2 data-reveal="title">Leave a dua for the couple</h2>
        <p>
          Your prayers and blessings are among the most precious gifts you can
          give us. Share a prayer, blessing, or a few loving words for this new
          journey together.
        </p>
      </div>
      <div
        className={`guestbook-layout ${
          messages.length === 0 ? "is-empty" : ""
        }`}
      >
        <form onSubmit={addMessage} data-reveal>
          <label htmlFor="guest-name">Your name</label>
          <input
            id="guest-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            maxLength={50}
          />
          <label htmlFor="guest-message">Your dua or message</label>
          <textarea
            id="guest-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="May Allah bless your journey together..."
            maxLength={240}
            rows={4}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sharing blessing..." : "Leave your blessing"}
          </button>
          <span role="status">{status}</span>
        </form>
        {messages.length > 0 && (
          <div className="dua-wall" data-reveal>
            {messages.map((item) => (
              <article key={item.id}>
                <p>“{item.message}”</p>
                <span>— {item.name}</span>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ShareInvitation() {
  const [status, setStatus] = useState("Share the invitation")
  const invitationText =
    "Join us in celebrating the wedding of Iffath Unnisa and Abdul Waseem Mohammed in Chicagoland on November 14–15, 2026."

  const share = async () => {
    const shareData = {
      title: "Iffath Unnisa & Abdul Waseem Mohammed",
      text: invitationText,
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setStatus("Invitation shared")
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setStatus("Invitation link copied")
      }
    } catch {
      setStatus("Share the invitation")
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setStatus("Invitation link copied")
  }

  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(
    `${invitationText} ${window.location.href}`,
  )}`

  return (
    <section className="share-section" data-reveal>
      <Monogram compact />
      <p>Celebrate with us, wherever you are</p>
      <h2>Share the invitation</h2>
      <p className="share-note">
        If you cannot be with us in person, we would still love for you to share
        in our joy.
      </p>
      <div className="share-actions">
        <button type="button" onClick={share}>
          {status}
        </button>
        <a href={whatsAppUrl} target="_blank" rel="noreferrer">
          Send on WhatsApp
        </a>
        <button type="button" onClick={copyLink}>
          Copy link
        </button>
      </div>
    </section>
  )
}

function App() {
  const [showOpening, setShowOpening] = useState(true)

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [showOpening])

  useEffect(() => {
    let animationFrame = 0

    const updateScrollMotion = () => {
      const root = document.documentElement
      const scrollable = root.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      root.style.setProperty("--scroll-progress", String(progress))
      root.style.setProperty("--hero-shift", `${window.scrollY * 0.09}px`)
      root.style.setProperty("--hero-copy-shift", `${window.scrollY * 0.02}px`)
    }

    const onScroll = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(updateScrollMotion)
    }

    updateScrollMotion()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <main className={showOpening ? "invitation-loading" : ""}>
      {showOpening && (
        <InvitationOpening onComplete={() => setShowOpening(false)} />
      )}
      <div className="scroll-progress" aria-hidden="true">
        <span />
      </div>
      <section className="hero" id="home">
        <nav className="nav" aria-label="Main navigation">
          <a
            className="monogram"
            href="#home"
            aria-label="Iffath Unnisa and Abdul Waseem Mohammed"
          >
            <Monogram compact />
          </a>
          <div className="nav-links">
            <a href="#story">Our story</a>
            <a href="#celebration">Celebration</a>
            <a href="#rsvp">RSVP</a>
            <a href="#guestbook">Duas</a>
            <a href="#blessing">Blessings</a>
          </div>
        </nav>

        <div className="hero-copy">
          <p className="eyebrow fade-up">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
          <p className="invitation fade-up delay-one">
            Together with their families
          </p>
          <h1 className="names fade-up delay-two">
            Iffath Unnisa
            <span className="ampersand">&</span>
            <span className="groom-name">Abdul Waseem Mohammed</span>
          </h1>
          <p className="hero-invite fade-up delay-three">
            joyfully invite you to celebrate their wedding...
          </p>
          <div className="hero-rule fade-up delay-three">
            <span />
            <p>November 14–15, 2026 · Chicagoland</p>
            <span />
          </div>
          <a className="discover fade-up delay-three" href="#celebration">
            View our celebration
          </a>
        </div>

        <p className="photo-credit">Photo by Amine İspir on Unsplash</p>
      </section>

      <section className="intro" id="story">
        <div className="intro-ornament">
          <ArchOrnament />
        </div>
        <p className="section-kicker" data-reveal>
          A sacred promise
        </p>
        <h2 data-reveal="title">Two souls, one beautiful beginning</h2>
        <p className="intro-copy" data-reveal>
          With gratitude in our hearts and the blessings of our families, we
          invite you to share in the joy of this blessed occasion as two
          families come together and a new chapter begins.
        </p>
        <div className="family-details" data-reveal>
          <div>
            <span>The bride</span>
            <strong>Iffath Unnisa</strong>
            <p>Daughter of MD Noor Ul Ellah Siddiqui</p>
          </div>
          <i>&</i>
          <div>
            <span>The groom</span>
            <strong>Abdul Waseem Mohammed</strong>
            <p>Son of Late Al-Haj Mohammed Abdul Basith</p>
          </div>
        </div>
        <div className="quote" data-reveal>
          <p className="arabic-verse" lang="ar" dir="rtl">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً
            وَرَحْمَةً
          </p>
          <p className="verse-translation">
            “And He placed between you affection and mercy.”
          </p>
          <span>Qur’an 30:21</span>
        </div>
      </section>

      <section className="celebration" id="celebration">
        <div className="section-heading" data-reveal>
          <p className="section-kicker">Meet us in Chicagoland</p>
          <h2 data-reveal="title">Our wedding events</h2>
          <p>
            With the blessings of our families, we warmly invite you to join us
            for two cherished celebrations.
          </p>
        </div>

        <div className="event-grid">
          <article className="event-card" data-reveal>
            <span className="event-number">01</span>
            <div>
              <p className="event-label">The sacred union</p>
              <h3>Nikah Ceremony</h3>
              <p>
                Saturday, November 14, 2026
                <br />
                6:00 PM onwards
              </p>
            </div>
            <div className="event-location">
              <strong>ICCD — Islamic Community Center of Des Plaines</strong>
              <p>
                480 Potter Rd
                <br />
                Des Plaines, IL 60016
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=ICCD+Islamic+Community+Center+of+Des+Plaines+480+Potter+Rd+Des+Plaines+IL+60016"
                target="_blank"
                rel="noreferrer"
              >
                View directions
              </a>
            </div>
          </article>

          <article className="event-card dark" data-reveal>
            <span className="event-number">02</span>
            <div>
              <p className="event-label">The joyful gathering</p>
              <h3>Reception</h3>
              <p>
                Sunday, November 15, 2026
                <br />
                7:00 PM onwards
              </p>
            </div>
            <div className="event-location">
              <strong>Albanian-American Islamic Center</strong>
              <p>
                5825 St Charles Rd
                <br />
                Berkeley, IL 60163
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Albanian-American+Islamic+Center+5825+St+Charles+Rd+Berkeley+IL+60163"
                target="_blank"
                rel="noreferrer"
              >
                View directions
              </a>
            </div>
          </article>
        </div>
      </section>

      <AudioExperience />

      <RsvpForm />

      <Guestbook />

      <section className="blessing" id="blessing">
        <div className="blessing-inner" data-reveal>
          <ArchOrnament />
          <p className="section-kicker">Keep us in your duas</p>
          <h2>بارك الله لكما وبارك عليكما وجمع بينكما في خير</h2>
          <p className="translation">
            May Allah bless you both, shower His blessings upon you, and unite
            you in goodness.
          </p>
          <div className="signature">
            <span>Iffath</span>
            <i>&</i>
            <span>Waseem</span>
          </div>
        </div>
      </section>

      <ShareInvitation />

      <footer>
        <p>With love and gratitude, Iffath & Waseem</p>
      </footer>
    </main>
  )
}

export default App
