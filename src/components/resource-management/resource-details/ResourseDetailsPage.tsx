import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteAllocationMutation, useGetResourceDetailsByUserIdQuery } from "../../../store/apis/resource-allocation/resource-allocation.api";
import { Button, ConfirmationModal } from "../../common";
import {
  HeatmapSkeleton,
  HistorySkeleton,
  ProjectCardSkeleton,
} from "./ResourceDetailsSkeleton";
import ResourceHeatmap, { calculateDailyUtilization } from "./ResourceHeatmap";
import ResourceHistoryCarousel from "./ResourceHistoryCarousel";
import ResourceProjectCard from "./ResourceProjectCards";


const ResourceDetailsPage = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/resource-allocation/resource-management");
  };

  const [deleteAllocation, { isLoading: isDeleting }] = useDeleteAllocationMutation();
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDeletionId, setCurrentDeletionId] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const {
    data: resourceDetails,
    isFetching,
    error
  } = useGetResourceDetailsByUserIdQuery(resourceId!, {
    skip: !resourceId,
  });

  const currentProjects = resourceDetails?.data?.currentProjects || [];
  const historyProjects = resourceDetails?.data?.previousProjects || [];
  if (error) return <div>Error loading details</div>;

  const utilizationData = calculateDailyUtilization([
    ...currentProjects,
    ...historyProjects,
  ]);

  const toggleConfirmationModal = (id?: string) => {
    setShowConfirmationModal(!showConfirmationModal);
    setCurrentDeletionId(id as string);
  };

  const confirmDelete = async () => {
    if (!currentDeletionId) return;

    try {
      await deleteAllocation(currentDeletionId).unwrap();

      toast.success("Allocation deleted successfully");

      setCurrentDeletionId(null);
      setShowConfirmationModal(false);
      setShowDeleteModal(false);

    } catch (err: any) {
      const errMsg = err?.data?.message || "An unexpected error occurred while deleting.";
      toast.error(errMsg);
      console.error("Deletion failed:", err);
    }
  };

  return (
    <div className="p-4 sm:px-6 max-w-full mx-auto">
      {/* PAGE TITLE */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 ">

        <h2 className="text-2xl sm:text-3xl font-semibold mb-0">
          Resource Details
        </h2>
        <Button
          appearance="ghost"
          onClick={() => {
            navigate('/resource-allocation/resource-management');
          }}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="md:w-auto text-slate-500 flex items-center justify-center md:justify-start w-24"
        >
          Back
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT COLUMN — Current Projects */}
        <div className="w-full lg:w-[40%] h-auto lg:h-[80vh] bg-white border rounded-lg shadow-soft flex flex-col">
          <div className=" border-b flex-shrink-0  ">
            <h3 className="text-lg sm:text-xl font-semibold p-4 mb-0">Current Active Allocations</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">

            <div className="space-y-4 h-full">
              {isFetching ? (
                <ProjectCardSkeleton />
              ) : currentProjects.length === 0 ? (
                <div className="space-y-4 flex-1 flex flex-col h-full">
                  <div className="flex-1 flex items-center justify-center text-slate-400">
                    No current projects
                  </div>
                </div>
              ) : (
                currentProjects.map((proj: any) => (
                  <ResourceProjectCard
                    key={proj._id}
                    data={proj}
                    mode="current"
                    confirmDelete={toggleConfirmationModal}
                    setShowDeleteModal={setShowDeleteModal}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-[60%] flex flex-col gap-4">

          {/* HEATMAP BOX */}
          <div className="bg-white border rounded-lg shadow-soft flex flex-col min-h-[250px] lg:h-[37%] overflow-hidden ">
            <div className="flex-1 flex items-start justify-center p-2 overflow-hidden">
              {loading ? (
                <HeatmapSkeleton />
              ) : utilizationData.length > 0 ? (
                <ResourceHeatmap data={utilizationData} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  No utilization data
                </div>
              )}

            </div>
          </div>

          {/* PROJECT HISTORY SECTION */}
          <div className="bg-white border rounded-lg shadow-soft flex flex-col p-2 lg:h-[63%] overflow-hidden">
            <div className="pt-2 pl-4 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-semibold">Project History</h3>
            </div>

            <div className="flex-1 px-2 overflow-y-visible py-2">
              {loading ? (
                <HistorySkeleton />
              ) : historyProjects.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 h-full">
                  No previous projects
                </div>
              ) : (
                <ResourceHistoryCarousel
                  items={historyProjects}
                  confirmDelete={toggleConfirmationModal}
                  setShowDeleteModal={setShowDeleteModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        type="danger"
        title="Delete Allocation"
        message="Are you sure you want to delete this allocation?"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        onClose={() => setShowConfirmationModal(false)}
      />
    </div>
  );
};

export default ResourceDetailsPage;
