import { ResponsiveBar } from '@nivo/bar';
import { useEffect, useState } from 'react';

interface IBarChart {
    data: {
        month: string,
        deadline: number
    }[]
}

const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

function BarChart({ data }: IBarChart) {
    const [updatedData, setUpdatedData] = useState<IBarChart['data']>(data);
    const maxDeadlines = Math.max(...data.map((d) => d.deadline));

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1200) {
                const convertToNumber = data.map((singleData) => {
                    const index = months.indexOf(singleData.month);
                    return {
                        month: `${index + 1}`,
                        deadline: singleData.deadline
                    }
                })

                setUpdatedData(convertToNumber);
            } else {
                setUpdatedData(data);
            }
        };
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [data]);

    return (
        <ResponsiveBar
            data={updatedData}
            keys={['deadline']}
            indexBy="month"
            margin={{ top: 40, right: 50, bottom: 50, left: 60 }}
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
                    translateX: 100,
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