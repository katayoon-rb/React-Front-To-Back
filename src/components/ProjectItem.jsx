import PropTypes from 'prop-types'
import Card from './shared/Card'

function ProjectItem({ item }) {
  return (
    <Card>
      <div className='num-display'>{item.id}</div>
      <div className='text-link'>
        <div className='text-display'>{item.text}</div>
        <a className='btn btn-primary' href={item.link}>View Project</a>
      </div>
    </Card>
  )
}

ProjectItem.propTypes = {
  item: PropTypes.object.isRequired
}

export default ProjectItem
