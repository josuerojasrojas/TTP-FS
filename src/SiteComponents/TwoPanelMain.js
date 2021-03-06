import React from 'react';
import { withRouter } from "react-router-dom";
import TwoPanels from '../Components/TwoPanels';
import SlideShowPanel from './SlideShowPanel';
import SigninPanel from './SigninPanel';
import UserFirstPanel from './UserFirstPanel';
import UserSecondPanel from './UserSecondPanel';
import Loader from '../Components/Loader';
import firebase from '../firebase';

// TODO: rename screen to panel
// handles loading, main page, and slideshow/sign in page all withing the two-panel component
function LoadingPanel(){
  // umm. resusing the slidehow classes (too lazy to style again for this)
  return (
    <div className='slideshow-panel panel-content' style={{position: 'relative'}}>
      <Loader isLoading={true} inverse={true}/>
    </div>
  )
}

class TwoPanelMain extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: null,
      isSignin: false,
      authObserver: null,
      initStart: true, // for loading screen
      sActive: false, // for sPanel when user login
      refreshStateKeyFirstPanel: Date.now(),
      refreshStateKeyHistoryPanel: Date.now(),
      altColor: false,
    }
    this.getFPanel = this.getFPanel.bind(this);
    this.getSPanel = this.getSPanel.bind(this);
    this.toggleSPanel = this.toggleSPanel.bind(this);
    this.refreshHistory = this.refreshHistory.bind(this);
    this.refreshUserPanel = this.refreshUserPanel.bind(this);
    this.toogleAltColor = this.toogleAltColor.bind(this);
  }

  componentDidMount(){
    let thisWrapper = this;
    firebase.auth().onAuthStateChanged(function(user){
      thisWrapper.setState({
        user: user,
        isSignin: user !== null,
        initStart: false
      })
      if(user === null && thisWrapper.props.location.pathname === '/'){
        thisWrapper.props.history.push('/signin');
      }
      else if(user){
        thisWrapper.props.history.push('/');
      }
    })
  }

  componentWillUnmount(){
    this.state.authObserver();
  }

  getFPanel(){
    if(this.state.initStart){
      // loading screeen
      return (<LoadingPanel/>)
    }
    else if(this.props.location.pathname === '/') {
      return (<UserFirstPanel
        altColorToggle={this.toogleAltColor}
        refreshCallback={this.refreshHistory}
        key={this.state.refreshStateKeyFirstPanel}
        toggleSPanel={this.toggleSPanel}
        sActive={this.state.sActive}
        user={this.state.user}
        firebase={firebase}/>)
    }
    else return <SlideShowPanel/>
  }

  getSPanel(){
    if(this.props.location.pathname === '/')
     return (
        <UserSecondPanel
          refreshCallback={this.refreshUserPanel}
          historyRefreshKey={this.state.refreshStateKeyHistoryPanel}
          user={this.state.user}
          firebase={firebase}/>
      );
    else return (<SigninPanel firebase={firebase}/>)
  }

  toggleSPanel(){
    this.setState({ sActive: !this.state.sActive })
  }

  refreshHistory(){
    this.setState({ refreshStateKeyHistoryPanel: Date.now() });
  }

  refreshUserPanel(){
    this.setState({ refreshStateKeyFirstPanel: Date.now() });
  }

  toogleAltColor(){
    this.setState({ altColor: !this.state.altColor });
  }

  render(){
    return(
      <div className={`App ${this.state.altColor ? 'alt-color' : ''}`}>
        <TwoPanels
          className={(this.state.user && !this.state.sActive) || this.state.initStart ? 'fActive' : ''}
          firstPanel={this.getFPanel()}
          secPanel={this.getSPanel()}
        />
      </div>
    )
  }
}

export default withRouter(TwoPanelMain);
