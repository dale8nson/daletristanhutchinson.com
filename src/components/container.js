import './scss/_container.scss';

const Container = ({className, style, children}) => {
  const containerProps = {
    className:`container ${className}`,
    style
  }
  return (
    <div {...containerProps}>
      {children}
    </div>
  )
}

export default Container;