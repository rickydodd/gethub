import { useState } from 'react'

type Props = {
  isActive: boolean
}

export default function LoadingScreen(props: Props) {
  return (
    <div id="loading" className={props.isActive ? '' : 'none'}>
      <div className="lds-roller">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}
