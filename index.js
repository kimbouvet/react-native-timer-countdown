import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, StyleSheet, ViewPropTypes as RNViewPropTypes } from 'react-native';
const ViewPropTypes = RNViewPropTypes || View.propTypes;

/**
 * A customizable countdown component for React Native.
 *
 * @export
 * @class TimerCountdown
 * @extends {React.Component}
 */

export default class TimerCountdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secondsRemaining: this.props.initialSecondsRemaining,
      timeoutId: null,
      previousSeconds: null
    };

    this.mounted = false;

    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.tick();
  }

  componentWillReceiveProps(newProps) {
    if (this.state.timeoutId) { clearTimeout(this.state.timeoutId); }
    this.setState({ previousSeconds: null, secondsRemaining: newProps.initialSecondsRemaining });
  }

  componentDidUpdate(nextProps, nextState) {
    if ((!this.state.previousSeconds) && this.state.secondsRemaining > 0 && this.mounted) {
      this.tick();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.state.timeoutId);
  }

  tick() {
    const currentSeconds = Date.now();
    const dt = this.state.previousSeconds ? (currentSeconds - this.state.previousSeconds) : 0;
    const interval = this.props.interval;

    // correct for small variations in actual timeout time
    const intervalSecondsRemaing = (interval - (dt % interval));
    let timeout = intervalSecondsRemaing;

    if (intervalSecondsRemaing < (interval / 2.0)) {
      timeout += interval;
    }

    const secondsRemaining = Math.max(this.state.secondsRemaining - dt, 0);
    const isComplete = (this.state.previousSeconds && secondsRemaining <= 0);

    if (this.mounted) {
      if (this.state.timeoutId) { clearTimeout(this.state.timeoutId); }
      this.setState({
        timeoutId: isComplete ? null : setTimeout(this.tick, timeout),
        previousSeconds: currentSeconds,
        secondsRemaining: secondsRemaining
      });
    }

    if (isComplete) {
      if (this.props.onTimeElapsed) { this.props.onTimeElapsed(); }
      return;
    }

    if (this.props.onTick) {
      this.props.onTick(secondsRemaining);
    }
  }

  getFormatetHours = (milliseconds) => {
    if (this.props.formatSecondsRemaining) {
      return this.props.formatSecondsRemaining(milliseconds);
    }

    const totalSeconds = Math.round(milliseconds / 1000);
    let hours = parseInt(totalSeconds / 3600, 10);

    hours = hours < 10 ? '0' + hours : hours;

    return hours;
  }

  getFormatetMinutes = (milliseconds) => {
    if (this.props.formatSecondsRemaining) {
      return this.props.formatSecondsRemaining(milliseconds);
    }

    const totalSeconds = Math.round(milliseconds / 1000);
    let minutes = parseInt(totalSeconds / 60, 10) % 60;

    minutes = minutes < 10 ? '0' + minutes : minutes;

    return minutes;
  }

  getFormatetSeconds = (milliseconds) => {
    if (this.props.formatSecondsRemaining) {
      return this.props.formatSecondsRemaining(milliseconds);
    }

    const totalSeconds = Math.round(milliseconds / 1000);
    let seconds = parseInt(totalSeconds % 60, 10)

    seconds = seconds < 10 ? '0' + seconds : seconds;

    return seconds;
  }

  renderDivider() {
    return(<Text style={styles.divider}>:</Text>)
  }

  renderSegment(time, label) {
    return (
    <View style={styles.segment}>
      <Text          
        allowFontScaling={this.props.allowFontScaling}
        style={this.props.style}>
        {time}
      </Text>
      <Text        
        allowFontScaling={this.props.allowFontScaling}
        style={[this.props.style, styles.label]}>
        {label}
      </Text>
    </View>
    );
  }

  render() {
    const { hoursLabel, minutesLabel, secondsLabel } = this.props;
    const secondsRemaining = this.state.secondsRemaining;
    return (
      <View style={styles.container}>
        {this.renderSegment(this.getFormatetHours(secondsRemaining), hoursLabel.toUpperCase())}
        {this.renderDivider()}
        {this.renderSegment(this.getFormatetMinutes(secondsRemaining), minutesLabel.toUpperCase())}
        {this.renderDivider()}
        {this.renderSegment(this.getFormatetSeconds(secondsRemaining), secondsLabel.toUpperCase())}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  segment: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    paddingHorizontal: 4,
  },
  label: {
    paddingHorizontal: 4,
    fontSize: 8,
    lineHeight: 11
  }
});

TimerCountdown.defaultProps = {
  interval: 1000,
  hoursLabel: 'hour',
  minutesLabel: 'sec',
  secondsLabel: 'min',
  formatSecondsRemaining: null,
  onTick: null,
  onTimeElapsed: null,
  allowFontScaling: false,
  style: {}
};

TimerCountdown.propTypes = {
  initialSecondsRemaining: PropTypes.number.isRequired,
  interval: PropTypes.number,
  hoursLabel: PropTypes.string,
  minutesLabel: PropTypes.string,
  secondsLabel: PropTypes.string,
  formatSecondsRemaining: PropTypes.func,
  onTick: PropTypes.func,
  onTimeElapsed: PropTypes.func,
  allowFontScaling: PropTypes.bool,
  style: Text.propTypes.style,
};
