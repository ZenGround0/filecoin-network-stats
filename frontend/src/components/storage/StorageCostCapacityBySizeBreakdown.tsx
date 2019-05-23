import * as React from 'react';
import {CostCapacityForMinerStat} from 'filecoin-network-stats-common/lib/domain/CostCapacityForMinerStat';
import bemify from '../../utils/bemify';
import ContentHeader from '../ContentHeader';
import './StorageCostCapacityBySizeBreakdown.scss';
import {AppState} from '../../ducks/store';
import {connect} from 'react-redux';
import Filesize, {SizeUnit} from '../../utils/Filesize';
import PercentageNumber from '../../utils/PercentageNumber';
import LabelledTooltip from '../LabelledTooltip';
import Tooltip from '../Tooltip';
import CurrencyWithTooltip from '../CurrencyWithTooltip';

const b = bemify('storage-cost-capacity-by-size-breakdown');

export interface StorageCostCapacityBySizeBreakdownProps {
  data: CostCapacityForMinerStat[]
}

export class StorageCostCapacityBySizeBreakdown extends React.Component<StorageCostCapacityBySizeBreakdownProps> {
  render () {
    return (
      <div className={b()}>
        <ContentHeader title={this.renderTitle()} />
        <div className={b('split')}>
          {this.renderSide(0)}
          {this.renderSide(1)}
        </div>
      </div>
    );
  }

  renderSide (idx: 0 | 1) {
    const data = this.props.data[idx];

    return (
      <div className={b('split-child')}>
        <div className={b('split-header')}>
          {idx === 0 ? '<' : '>='} 5 TB Storage Capacity
        </div>
        <div className={b('split-stats')}>
          {this.renderStat(data.count.toString(), `Total Miner${data.count === 1 ? '' : 's'}`)}
          {this.renderStat(this.renderPrice(data), 'Avg. Storage Price', 'FIL/GB/Mo')}
          {this.renderStat(Filesize.fromGB(data.averageCapacityGB).toUnit(SizeUnit.GB), 'Avg. Storage Capacity', 'GB')}
          {this.renderStat(PercentageNumber.create(data.utilization).toDisplay(false), 'Avg. Utilization', '%')}
        </div>
      </div>
    );
  }

  renderPrice (data: CostCapacityForMinerStat) {
    return (
      <React.Fragment>
        <CurrencyWithTooltip amount={data.averageStoragePrice.div('1e18')} />
      </React.Fragment>
    );
  }

  renderStat (value: React.ReactChild, label: string, unit?: string) {
    return (
      <div className={b('stat')}>
        <div className={b('stat-value')}>
          {value}{' ' }
          <small className={b('stat-unit')}>{unit ? unit : ''}</small>
        </div>
        <div className={b('stat-label')}>
          {label}
        </div>
      </div>
    );
  }

  renderTitle () {
    const explainer = `Stats are calculated across all time for miners included in each category.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Storage Price & Capacity by Miner Size" />
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    data: state.stats.stats.storage.costCapacityBySize,
  };
}

export default connect(mapStateToProps)(StorageCostCapacityBySizeBreakdown);