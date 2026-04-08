export default function About() {
  return (
    <div className="page max-w-2xl">
      <h1 className="page-heading">About World Zero</h1>

      <div className="card p-6 mb-6">
        <p className="font-body text-base leading-relaxed mb-4">
          World Zero is a community game played in the real world. Players create
          characters — public personas separate from their login identity — and
          compete by completing real-world tasks, posting proof of their actions,
          and earning points through community votes.
        </p>
        <p className="font-body text-base leading-relaxed">
          Every task has a level requirement. Every submission is rated by the
          community with a star vote. Points flow from votes; votes flow from
          participation. The leaderboard reflects not just effort, but community
          recognition.
        </p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-display text-2xl font-bold mb-3">How to Play</h2>
        <ol className="font-body text-base leading-relaxed space-y-2 list-decimal list-inside">
          <li>Sign in with Google and create a Character — your public game persona.</li>
          <li>Browse open Tasks and sign up for ones that interest you.</li>
          <li>Complete the task in the real world and post your proof (Praxis).</li>
          <li>The community votes on submissions with a star rating.</li>
          <li>Earn points, level up, and unlock new tasks and privileges.</li>
        </ol>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-2xl font-bold mb-3">Inspired by SF0</h2>
        <p className="font-body text-base leading-relaxed">
          World Zero is inspired by{' '}
          <a
            href="https://sf0.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-muted"
          >
            SF0
          </a>
          , the original collaborative art game created in San Francisco. SF0
          challenged players to complete tasks that blurred the line between game
          and life. World Zero carries that spirit forward as an open community
          platform.
        </p>
      </div>
    </div>
  )
}
