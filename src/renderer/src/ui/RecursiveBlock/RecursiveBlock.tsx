import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Item = { _id: string; text: string; result: string; delegation: Item[] }

export function RecursiveBlock({ item }: { item: Item }) {
  return (
    <>
      <div>
        <div className="p-2 mb-2 rounded-2xl border">
          <Textarea defaultValue={item.text} className="mb-2"></Textarea>
          <Button className="">Think</Button>
        </div>

        <div>
          {item.delegation.map((li) => {
            return <RecursiveBlock key={li._id} item={li}></RecursiveBlock>
          })}
        </div>
      </div>
    </>
  )
}
