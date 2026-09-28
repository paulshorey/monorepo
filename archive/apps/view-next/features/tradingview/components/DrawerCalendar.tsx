import classes from './Drawer.module.scss'

type Props = {
  drawerOpened: boolean
  closeDrawer: () => void
}

export function DrawerCalendar({ drawerOpened, closeDrawer }: Props) {
  const width = 360
  const height = window.screen.availHeight + 1
  const backColor = '1e222d'
  const fontColor = 'cccccc'
  return (
    <div
      className={`${classes.DrawerOverlay} scale2x`}
      onClick={closeDrawer}
      style={{
        width: drawerOpened ? '100vw' : 0,
      }}
    >
      <div
        className={classes.DrawerContent}
        style={{
          width: drawerOpened ? width : 0,
        }}
      >
        <button onClick={closeDrawer} className={classes.DrawerX}>
          X
        </button>
        <iframe
          style={{
            marginTop: '10px',
          }}
          width={width}
          height={height}
          src={`https://feed.financialjuice.com/widgets/ecocal.aspx?wtype=ECOCAL&mode=standard&container=financialjuice-eco-widget-container&width=${width}px&height=${height}px&backC=${backColor}&fontC=${fontColor}&affurl=`}
        ></iframe>
      </div>
    </div>
  )
}
