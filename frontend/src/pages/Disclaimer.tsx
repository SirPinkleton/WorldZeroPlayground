import PageTitle from '../components/ui/PageTitle'
export default function Disclaimer() {
  return (
    <div className="py-8 max-w-2xl">
      <PageTitle title="Disclaimer" />

      <div className="card p-6 space-y-5 font-body text-base leading-relaxed">
        <p>
          World Zero is a community game intended for entertainment purposes only.
          Nothing on this platform constitutes professional, legal, medical, or
          financial advice of any kind.
        </p>

        <p>
          Participation is entirely voluntary. Players are solely responsible for
          their own safety and the legality of any real-world actions taken in the
          course of completing tasks. The operators of World Zero are not liable
          for any harm, injury, damage, or legal consequence arising from
          participation in the game.
        </p>

        <p>
          All content on World Zero — including task descriptions, submissions, and
          comments — is user-generated. The operators do not endorse, verify, or
          take responsibility for user-posted material. Content that violates
          applicable law or community standards may be removed at the operators'
          discretion.
        </p>

        <p>
          World Zero is provided "as is" without warranty of any kind. The
          operators reserve the right to modify, suspend, or discontinue the
          platform at any time without notice.
        </p>

        <p className="text-muted text-sm">Last updated: April 2026</p>
      </div>
    </div>
  )
}
