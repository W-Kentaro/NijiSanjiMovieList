const React = require('react');
const axios = require('axios');

import UserList from './parts/list';

const api_json = './key/api.json';
const vTuber_json = './data/nijisanji.json';

const youtubeChannelApi = {
  snippet: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&id='
};

class App extends React.Component{
  constructor() {
    super();
    this.state = {
      isActive: false,
      counter: 0,
      api: {
        key: '',
        data: []
      },
      userData: []
    };
    this.toggleClass = this.toggleClass.bind(this);
  }

  // get youtube api
  getApiJson() {
    this.setState({isMounted: false});
    axios
      .get(api_json)
      .then((results) => {
        const data = results.data;
        this.setState({
          api: {
            key: data.items[0].youtube.api
          }
        });
        this.getVtuberJson();
      });
  }

  // get member json
  getVtuberJson() {
    axios
      .get(vTuber_json)
      .then((results) => {
        const data = results.data;
        const dataLength = data.items.length;
        for(let i = 0; i < data.items.length; i++){
          this.getChannelData(data.items[i].channelId, i, dataLength);
        }
      });
  }

  // get channel data
  getChannelData(channelId, num, length) {

    const maxCount = length;
    axios
      .get(youtubeChannelApi.snippet + channelId + '&key=' + this.state.api.key)
      .then((results) => {
        const data = results.data;
        if(num === 0){
          this.setState({
            userData: [data]
          });
          this.state.counter++;
        }
        else{
          this.setState({
            userData: [...this.state.userData, data]
          });
          this.state.counter++;
          if(this.state.counter === maxCount){
            this.setState({isMounted: true});
          }
        }
      });
  }

  toggleClass() {
    this.setState({
      isActive: !this.state.isActive
    });
  }

  componentDidMount() {
    this.getApiJson();
  }

  render() {
    if(this.state.isMounted === false){
      return (
        <div className={this.state.isActive ? 'wrap is-active' : 'wrap'}>
          <p>Now Loading...</p>
        </div>
      )
    }
    else{
      return (
        <div className={this.state.isActive ? 'wrap is-active' : 'wrap'}>
          <UserList userData={this.state.userData} isMounted={this.state.isMounted}/>
        </div>
      )
    }
  }
}

module.exports = App;