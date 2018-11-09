import React from 'react';
import './App.css';

import { TransitionGroup, CSSTransition } from "react-transition-group";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import BasicDetailsForm from './components/PremiumOffer/BasicDetailsForm.jsx';
import ConditionForm from './components/PremiumOffer/ConditionForm.jsx';
import PhotosForm from './components/PremiumOffer/PhotosForm.jsx';
import ServiceHistoryForm from './components/PremiumOffer/ServiceHistoryForm.jsx';
import WheelsAndTyresForm from './components/PremiumOffer/WheelsAndTyresForm.jsx';

import Summary from './components/Form/Summary.jsx';
import HiddenForms from './components/Form/HiddenForms.jsx';
import Start from './components/PremiumOffer/Start.jsx';

let accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImF2cmlsQG1vdG9yd2F5LmNvLnVrIiwicG9zdGNvZGUiOiJXMzZBVyIsImlhdCI6MTUzOTI2ODY3MiwiZXhwIjoxNTQxODYwNjcyfQ.tgU3Hdld6IRzBjsS1ZUGfDu3YTCHq6x_j2l3QOzLEnU`;
let params = (new URL(document.location)).searchParams;
let token = params.get('token') || accessToken;
let vrm = params.get('vrm') || 'HJ1';
let platform = params.get('platform') || 'http://192.168.86.110:3030/api';

class App extends React.Component {
  constructor(props) {
    super(props);
      // window.open(`http://192.168.86.111:8080/?token=${__INITIAL_STATE__.user.auth_token}&vrm=${window.location.pathname.split('/')[1]}&platform=${__INITIAL_STATE__.platformApi}`)
      this.update = this.update.bind(this);
      this.renderDirection = this.renderDirection.bind(this);

      this._previousLocation = {};

      this.routes = [
        'basic-details',
        'service-history',
        'condition',
        'wheels-and-tyres',
        'photos',
        'summary-view'
      ];

      this.state = {
        raw: {},
        progress: {},
        loading: true
      };
    }

    update(e, data) {
      if (e && e.persist) { e.persist(); }

      let state = {...this.state};
      state.progress[data.name] = data.progress;
      state.raw[data.name] = data.raw;

      this.setState(state);

      let setState = () => {
      let offer = Object.assign({}, this.state.offer);
      offer[data.name] = data.data;

      this.setState({
        offer,
      }, () => {
        console.log(`%c${e.type} event`, 'font-weight: bold; text-decoration: underline; text-transform: capitalize; ', 'Sending to API =>', offer);

        // Silly visual effect, not really needed
        let $summary = document.getElementById('summary');
        let $li = $summary.querySelector(`li[data-value*="${e.target.name || e.target.value}"]`);

        // Doesn't work on fieldsets yet when removing item
        if ($li) {
          $li.addEventListener('animationend', () => {
            $li.classList.remove('change');
          }, {
            once: true
          });
          $li.classList.remove('change');
          requestAnimationFrame(() => {
            $li.classList.add('change');
            //$li.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
          });
        }

        fetch(`${platform}/vehicle-details`,
          {
            "credentials":"omit",
            "headers": {
              "content-type": "application/json",
              "x-access-token": accessToken
            },
            "body": JSON.stringify({
              id: this.state.id,
              filled_sections: ["basic_details", "service_history", "condition", "wheels_and_tyres", "photos"],
              data: this.state.offer
            }),
            "method":"POST",
            "mode":"cors"
          });
      });
    };

    if (e && e.target) {
      if (e.target.tagName === 'SELECT' || ['checkbox', 'radio', 'month'].includes(e.target.type)) {
        if (e.type === 'change') {
          setState();
        }
      } else if (e.type === 'blur') {
        setState();
      }
      return;
    }
  }

  async componentDidMount() {
    //fetch("https://motorway-platform-stage.herokuapp.com/api/premium-offer?vrm=RD1", {"credentials":"omit","headers":{"x-access-token":accessToken},"body":null,"method":"GET","mode":"no-cors"})
    //fetch(`${platform}/premium-offer?vrm=${vrm}`, {"credentials":"omit","headers":{"x-access-token":token},"body":null,"method":"GET","mode":"cors"})
    fetch('/offer.json')
      .then(resp => resp.json())
      .then((offer) => {
        if (!offer.data) {
          return this.setState({
            failed: true
          });
        }

        this.setState({
          id: offer.id,
          loading: false,
          offer: offer.data,
          filledSections: offer.filled_sections,
          initialData: offer,
          photos: offer.photos
        }, () => {
          console.log(offer);
        });
    })
    .catch((e) => {
      console.log(e);
      this.setState({
        failed: true
      });
    });
  }

  renderDirection(location) {
    let prev, now;
    this.routes.forEach((r, i) => {
      if (this._previousLocation.pathname && this._previousLocation.pathname.includes(r)) { prev = i; }
      if (location.pathname.includes(r)) { now = i; }
    });
    this._previousLocation = location;

    return (prev > now) ? 'prev' : 'next';
  }

  hydrateUpToDateData(name) {
    // Due to constant mounting/unmounting, ensure the latest data or on initialLoad, provide API data
    return this.state.offer[name] || this.state.initialData.data[name];
  }

  render() {
    if (this.state.loading || this.state.failed) {
      return (
        <div className="loading">
          { (this.state.failed) ? 'Failed' : 'Loading...' }
        </div>
      );
    }

    let routes = this.routes;

    let steps = {
      basic_details : <BasicDetailsForm key='basic_details' initialData={this.hydrateUpToDateData('basic_details')} fields={this.state.initialData.fields} model={this.state.offer} />,
      service_history: <ServiceHistoryForm key='service_history' initialData={this.hydrateUpToDateData('service_history')} />,
      condition: <ConditionForm key='condition' initialData={this.hydrateUpToDateData('condition')} />,
      wheels_and_tyres: <WheelsAndTyresForm key='wheels_and_tyres' initialData={this.hydrateUpToDateData('wheels_and_tyres')} />,
      photos: <PhotosForm key='photos' id={this.state.id} photos={this.state.photos} conditionAndWheels={{condition: this.hydrateUpToDateData('condition'), wheels_and_tyres: this.hydrateUpToDateData('wheels_and_tyres')}}/>,
      summary_view: <Summary key='summary' order={routes.map(r => r.replace(/-/g, '_'))} data={this.state.raw} offer={this.state.offer} />
    };

    return (
      <Router>
        <Route
          render={({ location }) => (
          <React.Fragment>
            <div className="progress">
              {
                Object.keys(steps).filter((s,i) => (i !== routes.length - 1)).map(s => {
                  let r = `/${s.replace(/_/g, '-')}`;
                  let path = location.pathname.replace(/^\//, '');
                  let here = (path.length > 0) ? r.includes(location.pathname.replace(/^\//, '')) : false;

                  return (this.state.progress[s]) ? (
                    <div className={(here) ? 'here' : null} key={s} data-percentage={`${this.state.progress[s].percentage}%`}>
                        {
                          (!here) ? (<Link to={r} />) : (null)
                        }
                        <span style={{height: `${this.state.progress[s].percentage}%`}}></span>
                    </div>
                  ) : (
                    <div key={s}>
                      <div></div>
                    </div>
                  )
                })
              }
            </div>
            <div className="container">
              <div className="forms">
                <TransitionGroup>
                  <CSSTransition
                    key={location.key}
                    classNames={this.renderDirection(location)}
                    timeout={300}
                  >
                    <Switch location={location}>
                      {
                        Object.keys(steps).map(s => {
                          let r = `/${s.replace(/_/g, '-')}`;
                          return (
                            <Route key={r} exact path={r} render={() => {
                              return React.cloneElement(steps[s], {
                                location: location,
                                routes: routes,
                                update: this.update,
                                seen: this.state.filledSections.includes(s),
                              });
                            }} />
                          )
                        })
                      }
                      <Route render={() => {
                        return (<div><Start/></div>)
                      }} />
                    </Switch>
                  </CSSTransition>
                </TransitionGroup>
              </div>
              <div id="summary">
                <Summary order={Object.keys(steps)} data={this.state.raw} offer={this.state.offer} />
              </div>
            </div>
            {/* TODO - Pass in hidden props so not to bother rendering them */}
            <HiddenForms>
              {Object.values(steps).filter(s => {
                return (!location.pathname.includes(s.key.replace(/_/g, '-')));
              }).map(s => {
                return React.cloneElement(s, {
                  location: location,
                  routes: routes,
                  update: this.update
                });
              })}
            </HiddenForms>
    </React.Fragment>
    )}/></Router>
    );
  }
}

export default App;
