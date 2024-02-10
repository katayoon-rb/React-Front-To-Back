function RatingSelect({ select, selected }) {
  return (
    <ul className='rating'>
      {Array.from({ length: 10 }, (_, i) => (
        <li key={`rating-${i + 1}`}>
          <input type='radio'
            name='rating' value={i + 1}
            id={`num${i + 1}`}
            onChange={e => {
              select(+e.currentTarget.value)
            }}
            checked={selected === i + 1}
          />
          <label htmlFor={`num${i + 1}`}>
            {i + 1}
          </label>
        </li>
      ))}
    </ul>
  )
}

export default RatingSelect
