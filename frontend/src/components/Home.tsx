import * as React from 'react';
import bemify from '../utils/bemify';
import {Col, Grid} from './Grid';
import {SingleStat} from './SingleStat';
import {ContentArea} from './ContentArea';
import MiningSummary from './MiningSummary';
import {connect} from 'react-redux';
import {AppState} from '../ducks/store';
import {MarketStats, StorageStats} from 'filecoin-network-stats-common/lib/domain/Stats';
import Filesize, {SizeUnit} from '../utils/Filesize';
import NodeMap from './NodeMap';
import PageHeader from './PageHeader';
//import AverageStorageCostChart from './storage/AverageStorageCostChart';
import StorageMinersTable from './storage/StorageMinersTable';
import Currency from '../utils/Currency';
import PercentageNumber from '../utils/PercentageNumber';
import GainLossTimelineChart from './GainLossTimelineChart';
import BigNumber from 'bignumber.js';
import Tooltip from './Tooltip';
import CapacityTooltip from './CapacityTooltip';
import UtilizationTooltip from './UtilizationTooltip';
import AveragePriceTooltip from './AveragePriceTooltip';
import LabelledTooltip from './LabelledTooltip';
import VolumeTransactedTooltip from './VolumeTransactedTooltip';
import {SwitchableDateSwitchingChart} from './SwitchableDateSwitchingChart';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import {Dispatch} from 'redux';
import {setOverride} from '../ducks/overrides';

const b = bemify('home');

export interface HomeStateProps {
  storageStats: StorageStats | null
  marketStats: MarketStats | null
}

export interface HomeDispatchProps {
  setPriceOverride: (dur: ChartDuration) => any,
  setVolumeOverride: (dur: ChartDuration) => any,
}

export type HomeProps = HomeStateProps & HomeDispatchProps

export class Home extends React.Component<HomeProps, {}> {
  render () {
    const totalStorage = Filesize.fromGB(this.props.storageStats.storageAmount.total).smartUnit();
    const averageCost = new Currency(this.props.storageStats.storageCost.average);
    const utilization = this.props.storageStats.networkUtilization;
    const currentUtilization = utilization[utilization.length - 1].amount;
    let utilizationTrend;
    if (utilization.length > 1) {
      utilizationTrend = (currentUtilization.gt(0) ? currentUtilization.minus(utilization[utilization.length - 2].amount)
        .div(currentUtilization) : new BigNumber(1)).multipliedBy(100);
    } else {
      utilizationTrend = new BigNumber(100);
    }
    const utilizationTrendNum = Number(utilizationTrend.toFixed(1));

    return (
      <div className={b()}>
        <ContentArea>
          <PageHeader title="Network Overview" />
          <Grid>
            <Col>
              <MiningSummary />
            </Col>
          </Grid>
          <Grid>
            <Col>
              <SingleStat
                value={averageCost.toDisplay()}
                unit="FIL/GB/Mo"
                subtitle="Avg. Price of Storage"
                rolloverValue={`${averageCost.toFullPrecision()} FIL/GB/Month`}
                trend={PercentageNumber.create(this.props.storageStats.storageCost.trend).toNumber()}
                duration="24 hrs"
                tooltip={<AveragePriceTooltip />}
              />
            </Col>
            <Col>
              <SingleStat
                value={totalStorage.size.toFixed(0)}
                unit={totalStorage.unitString}
                subtitle="Current Network Storage Capacity"
                tooltip={<CapacityTooltip />}
                trend={PercentageNumber.create(this.props.storageStats.storageAmount.trend).toNumber()}
                duration="24 hrs"
              />
            </Col>
            <Col>
              <SingleStat
                value={PercentageNumber.create(currentUtilization).toDisplay(false)}
                unit={'%'}
                tooltip={<UtilizationTooltip />}
                trend={utilizationTrendNum}
                subtitle={'Current Network Utilization'}
                duration="24 hrs"
              />
            </Col>
            <Col unsupported>
              <SingleStat
                value="--"
                unit=""
                tooltip={<Tooltip content="Retrieval data is coming soon." greyscale />}
                subtitle="Avg. Price of Retrieval"
              />
            </Col>
          </Grid>
          <Grid>
            <Col>
              <NodeMap />
            </Col>
          </Grid>
          <Grid>
            <Col>
              <StorageMinersTable />
            </Col>
          </Grid>
        </ContentArea>
      </div>
    );
  }

  onChangeDuration = async (chartIndex: number, duration: ChartDuration) => {
    if (chartIndex === 0) {
      return this.props.setPriceOverride(duration);
    }

    return this.props.setVolumeOverride(duration);
  };
}

function mapStateToProps (state: AppState) {
  return {
    storageStats: state.stats.stats ? state.stats.stats.storage : null,
    marketStats: state.stats.stats ? state.stats.stats.market : null,
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>) {
  return {
    setPriceOverride: (dur: ChartDuration) => dispatch(setOverride('storage', 'historicalStoragePrice', dur)),
    setVolumeOverride: (dur: ChartDuration) => dispatch(setOverride('market', 'historicalTokenVolume', dur)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);