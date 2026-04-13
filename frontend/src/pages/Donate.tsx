export default function Donate() {
  return (
    <div className="py-8 max-w-2xl text-center">
      <h1 className="page-heading text-center">Support World Zero</h1>

      <div className="card p-8 mb-6">
        <p className="font-body text-base leading-relaxed mb-6">
          World Zero is a community project built and maintained by volunteers.
          If you enjoy the game and want to help keep it running, consider
          supporting us on Patreon. Every contribution goes directly toward
          hosting, development, and keeping the game free for everyone.
        </p>
        <a
          href="https://www.patreon.com/c/WorldZero"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-base px-8 py-2 inline-block"
        >
          Support on Patreon
        </a>
      </div>

      <p className="font-body text-sm text-muted">
        You can also support the project by playing, posting praxis, and
        spreading the word.
      </p>
    </div>
  )
}
