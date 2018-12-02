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
        data: [],
        dataLength: null
      },
      userData: {}
    };
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
        this.setState(prevState => {
          return {
            dataLength: data.length
          }
        });
        for(let i = 0; i < data.length; i++){
          this.getChannelData(i, data[i].channelId, data[i].belong);
        }
      });
  }

  // get channel data
  getChannelData(num, channelId, belong) {

    axios
      .get(youtubeChannelApi.snippet + channelId + '&key=' + this.state.api.key)
      .then((results) => {
        const data = {
          no: num,
          belong: belong,
          value: results.data
        };
        if(this.state.counter === 0){
          this.setState(prevState => {
            return {
              userData: [data]
            }
          });
          this.state.counter++;
        }
        else{
          this.setState(prevState => {
            return {
              userData: [...prevState.userData, data]
            }
          });
          this.state.counter++;
          if(this.state.counter === this.state.dataLength){
            this.setState(prevState => {
              this.userData = prevState.userData.sort((a, b) => {
                return (a.no < b.no) ? -1 : 1;
              });
            });
            this.setState({isMounted: true});
          }
        }
      });
  }
  componentWillMount() {
    this.setState(prevState => {
      return {
        isActive: !prevState.isActive
      }
    });
  }
  componentDidMount() {
    this.getApiJson();
  }

  render() {
    if(this.state.isMounted === false){
      return (
        <div className={this.state.isActive ? 'l-app is-active' : 'l-app'}>
          <p>Now Loading...</p>
        </div>
      )
    }
    else{
      return (
        <div className={this.state.isActive ? 'l-app is-active' : 'l-app'}>
          <div className="l-app__container">
            <section className="l-side">
              <div className="l-side__container">
                <div className="l-side__header"></div>
                <div className="l-side__inner"></div>
              </div>
            </section>
            <section className="l-userList">
              <UserList userData={this.state.userData} isMounted={this.state.isMounted}/>
            </section>
          </div>
        </div>
      )
    }
  }
}

module.exports = App;