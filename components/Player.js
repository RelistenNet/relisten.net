import { Component } from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import Link from 'next/link'

import bands from '../lib/bands'
import { createShowDate, durationToHHMMSS, removeLeadingZero, splitShowDate } from '../lib/utils'
import player from '../lib/player'

import Queue from './Queue'

class Player extends Component {
  constructor(props, ctx) {
    super(props, ctx)

    this.state = {
      showQueue: false
    }
  }

  render() {
    const { playback, tapes } = this.props;

    const { year, month, day } = splitShowDate(playback.showDate)
    const { artistSlug, source } = playback
    const bandTitle = bands[artistSlug] ? bands[artistSlug].name : ''
    const activeTrack = playback.tracks.find((track, idx) => idx === playback.activeTrack.idx);
    const nextTrack = playback.tracks.find((track, idx) => idx === playback.activeTrack.idx + 1);
    const notchPosition = typeof window === 'undefined' || !this.player ? 0 : (playback.activeTrack.currentTime / playback.activeTrack.duration) * this.player.clientWidth;

    return (
      <div className="container">
        <style jsx>{`
          .container {
            height: 50px;
            display: flex;
            position: relative;
          }

          .container .fa {
            cursor: pointer;
          }

          .playpause, .queue-button {
            width: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #7A7A7A;
            cursor: pointer;
          }

          .player {
            height: 100%;
            flex: 1;
            position: relative;
          }

          .content {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            transition: all 1s ease-in-out;
            height: 100%;
          }

          .progress-container {
            width: 100%;
            height: 4px;
            background: #BCBCBC;
            position: absolute;
            left: 0;
            bottom: 0;
            z-index: 1;
            cursor: pointer;
          }

          .progress-background {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4px;
            background: #707070;
            transition: width 64ms linear;
          }

          .progress-notch {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 3px;
            height: 8px;
            background: #000;
            transition: transform 64ms linear;
            z-index: 1;
          }

          .info {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 8px 0;
          }

          .song-title {
            color: #3C3C3C;
            font-size: 1em;
            position: relative;
          }

          .after-song-title {
            display: flex;
            align-items: center;
            position: absolute;
            width: 100%;
            left: 100%;
            top: 2px;
            margin-left: 8px;
            font-size: 0.8em;
            color: #7A7A7A;
          }

          .band-title {
            color: #7A7A7A;
            font-size: 0.8em;
          }

          .timing {
            color: #7A7A7A;
            margin: 0 8px;
            margin-top: auto;
            margin-bottom: 8px;
            font-size: 0.8em;
          }

        `}</style>
        {activeTrack && <Head>
          <title>{`${playback.activeTrack.isPaused ? '❚ ❚' : '▶'} ${activeTrack.title} ${removeLeadingZero(month)}/${removeLeadingZero(day)}/${year.slice(2)} ${bandTitle}`} | Relisten</title>
        </Head>}
        <div className="playpause" onClick={() => player.togglePlayPause()}>
          <i className={`fa fa-${playback.activeTrack.isPaused ? 'play' : 'pause'}`} />
        </div>
        {typeof window === 'undefined' || !activeTrack ? null :
          <div className="player" ref={ref => this.player = ref}>
            <div className="content">
              <div className="timing">
                <div><i className="fa fa-backward" onClick={() => player.playPrevious()} /></div>
                <div>{durationToHHMMSS(playback.activeTrack.currentTime)}</div>
              </div>
              <div className="info">
                <div className="song-title">
                  {activeTrack.title}
                  {false &&<div className="after-song-title">
                    <div>Next: {nextTrack && nextTrack.title}&nbsp;</div>
                    <i className="fa fa-angle-down" />
                  </div>}
                </div>

                <Link href="/" as={`/${artistSlug}/${year}/${month}/${day}?source=${source}`}><a className="band-title">{bandTitle} – {removeLeadingZero(month)}/{removeLeadingZero(day)}/{year.slice(2)}</a></Link>
              </div>
              <div className="timing">
                <div><i className="fa fa-forward" onClick={() => player.playNext()} /></div>
                <div>{durationToHHMMSS(playback.activeTrack.duration)}</div>
              </div>
            </div>
            <div className="progress-container" onClick={this.onProgressClick} style={{ opacity: playback.activeTrack.currentTime < 0.1 ? 0.8 : null }}>
              <div className="progress-background" style={{ width: notchPosition ? notchPosition + 2 : null }} />
              <div className="progress-notch" style={{ transform: `translate(${notchPosition}px, 0)` }} />
            </div>
          </div>
        }
        <div className="queue-button" onClick={this.toggleQueue}><i className="fa fa-list-ol" /></div>
        {this.state.showQueue && <Queue playback={playback} tapes={tapes} closeQueue={this.toggleQueue} />}
      </div>
    );
  }

  onProgressClick = (e) => {
    const { playback } = this.props;

    const { left, width } = this.player.getBoundingClientRect()

    const percentage = (e.pageX - left) / width;

    player.currentTrack.seek(percentage * playback.activeTrack.duration)
  }

  toggleQueue = () => {
    this.setState({ showQueue: !this.state.showQueue })
  }
}

const mapStateToProps = ({ playback, tapes }) => ({ playback, tapes })

export default connect(mapStateToProps)(Player)
