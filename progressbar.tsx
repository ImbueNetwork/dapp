<div className="w-48 bg-[#1C2608] h-1 relative mt-5">
                            <div
                                style={{
                                    width: `${(application?.milestones?.filter((m) => m.is_approved)?.length / application.milestones?.length) * 100}%`
                                }}
                                className="h-full rounded-xl Accepted-button absolute">
                            </div>
                            <div className="flex justify-evenly">
                                {
                                    application.milestones.map((m) => (<div className={`h-4 w-4 ${m.is_approved ? "Accepted-button" : "bg-[#1C2608]"} rounded-full -mt-1.5`}></div>))
                                }
                            </div>
                        </div>