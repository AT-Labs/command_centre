import React from 'react';

import { getHealthMonitorData } from '../../utils/transmitters/cc-static';
import Cluster from './Cluster/Cluster';
import Main from '../Common/OffCanvasLayout/Main/Main';
import OffCanvasLayout from '../Common/OffCanvasLayout/OffCanvasLayout';
import SecondarySidePanel from '../Common/OffCanvasLayout/SecondarySidePanel/SecondarySidePanel';

export default class DashboardView extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: [] };
        this.intervalId = null;
    }

    componentDidMount() {
        this.intervalId = setInterval(async () => {
            const healthData = await getHealthMonitorData();
            this.setState({ data: healthData });
        }, 1000);
    }

    componentWillUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    render() {
        return (
            <OffCanvasLayout>
                <Main className="control-view p-4">
                    <h1>System health dashboard</h1>
                    <p>
                        System inputs and effects over the last 24 hours.
                        <br />
                        A red bar indicates that the component is not receiving any input data.
                    </p>
                    {this.state.data.map(cluster => <Cluster data={ cluster } />)}
                </Main>
                <SecondarySidePanel />
            </OffCanvasLayout>
        );
    }
}
