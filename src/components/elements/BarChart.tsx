import { ResponsiveBar } from '@nivo/bar';

interface IBarChart {
    data: {
        month: string,
        deadline: number
    }[]
}

function BarChart({ data }: IBarChart) {
    const maxDeadlines = Math.max(...data.map((d) => d.deadline));

    return (
        <ResponsiveBar
            data={data}
            keys={['deadline']}
            indexBy="month"
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            padding={0.3}
            colors={{ scheme: 'nivo' }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Month',
                legendPosition: 'middle',
                legendOffset: 32,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Deadline(s)',
                legendPosition: 'middle',
                legendOffset: -40,
                tickValues: Array.from({ length: maxDeadlines + 1 }, (_, i) => i).filter((value) => value % 5 === 0)
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            legends={[
                {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                },
            ]}
            animate={true}
        />
    )
}

export default BarChart;